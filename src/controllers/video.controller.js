import Video from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
    deleteFromCloudinary,
    uploadOnCloudinary
} from "../utils/cloudinary.js";
import mongoose from "mongoose";


const publishAVideo = asyncHandler(async (req, res) => {

    const videoFileLocalPath = req.files?.videoFile?.[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path

    const { title, description } = req.body

    const userId = req.user?._id

    if (!videoFileLocalPath) {
        throw new ApiError(400, "Video file is required")
    }

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail is required")
    }

    if (
        [title, description].some(
            (field) => !field || field.trim() === ""
        )
    ) {
        throw new ApiError(400, "Title and description are required")
    }

    const videoFileUpload = await uploadOnCloudinary(videoFileLocalPath)
    const thumbnailUpload = await uploadOnCloudinary(thumbnailLocalPath)

    if (!videoFileUpload) {
        throw new ApiError(400, "Video upload failed")
    }

    if (!thumbnailUpload) {
        throw new ApiError(400, "Thumbnail upload failed")
    }

    const video = await Video.create({
        title,
        description,
        videoFile: videoFileUpload.url,
        thumbnail: thumbnailUpload.url,
        duration: videoFileUpload.duration,
        owner: userId,
        isPublished: true
    })

    return res
        .status(201)
        .json(
            new ApiResponse(201, video, "Video published successfully")
        )
})


const getVideoById = asyncHandler(async (req, res) => {

    const { videoId } = req.params

    if (!videoId) {
        throw new ApiError(400, "Video ID is required")
    }

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID format")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, video, "Video found successfully")
        )
})


const updateVideo = asyncHandler(async (req, res) => {

    const { videoId } = req.params
    const { title, description } = req.body

    const thumbnailLocalPath = req.file?.path

    const userId = req.user?._id

    if (!videoId) {
        throw new ApiError(400, "Video ID is required")
    }


    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    if (video.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "You are not authorized to update this video")
    }

    const updateFields = {}

    if (title?.trim()) updateFields.title = title.trim()
    if (description?.trim()) updateFields.description = description.trim()

    if (thumbnailLocalPath) {
        if (video.thumbnailPublicId) {
            await deleteFromCloudinary(video.thumbnailPublicId, "image")
        }

        const thumbnailUpload = await uploadOnCloudinary(thumbnailLocalPath)

        if (!thumbnailUpload) {
            throw new ApiError(400, "Thumbnail upload failed")
        }

        updateFields.thumbnail = thumbnailUpload.url
    }

    if (Object.keys(updateFields).length === 0) {
        throw new ApiError(400, "Please provide at least one field to update")
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        { $set: updateFields },
        { new: true }
    )

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedVideo, "Video updated successfully")
        )
})


const deleteVideo = asyncHandler(async (req, res) => {

    const { videoId } = req.params
    const userId = req.user?._id

    if (!videoId) {
        throw new ApiError(400, "Video ID is required")
    }

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid ID format")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "No video found with this ID")
    }

    if (video.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "You are not authorized to delete this video")
    }

    await deleteFromCloudinary(video.videoFilePublicId, "video")
    await deleteFromCloudinary(video.thumbnailPublicId, "image")

    await Video.findByIdAndDelete(videoId)

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Video deleted successfully")
        )
})

const togglePublishStatus = asyncHandler(async (req, res) => {

    const { videoId } = req.params
    const userId = req.user?._id

    if (!videoId) {
        throw new ApiError(400, "Video ID is required")
    }

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid ID format")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "No video found with this ID")
    }

    if (video.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "You are not authorized")
    }

    const newStatus = !video.isPublished

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        { $set: { isPublished: newStatus } },
        { new: true }
    )

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedVideo,
                `Video ${newStatus ? "published" : "unpublished"} successfully`
            )
        )
})


const getAllVideos = asyncHandler(async (req, res) => {

    const {
        page = 1,
        limit = 10,
        query,
        sortBy = "createdAt",
        sortType = "desc",
        userId
    } = req.query

    if (userId && !mongoose.isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid userId")
    }

    const pageNumber = parseInt(page)
    const limitNumber = parseInt(limit)

    const matchStage = {}

    if (query) {
        matchStage.title = { $regex: query, $options: "i" }
    }

    if (userId) {
        matchStage.owner = new mongoose.Types.ObjectId(userId)
    }

    matchStage.isPublished = true

    const sortStage = {}
    sortStage[sortBy] = sortType === "desc" ? -1 : 1

    const videos = await Video.aggregate([
        { $match: matchStage },
        { $sort: sortStage },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                ownerDetails: { $first: "$ownerDetails" }
            }
        }
    ])

    const startIndex = (pageNumber - 1) * limitNumber

    const paginatedVideos = videos.slice(startIndex, startIndex + limitNumber)
    const totalVideos = videos.length

    if (!paginatedVideos.length) {
        throw new ApiError(404, "No videos found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    videos: paginatedVideos,
                    totalVideos,
                    currentPage: pageNumber,
                    limit: limitNumber
                },
                "Videos fetched successfully"
            )
        )
})


export {
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    getAllVideos
}