import { Playlist } from "../models/playlist.model";
import { Video } from "../models/video.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary";
import mongoose from "mongoose";
/*1. createPlaylist
2. getUserPlaylists
3. getPlaylistById
4. addVideoToPlaylist
5. removeVideoFromPlaylist
6. deletePlaylist
7. updatePlaylist */
const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const owner = req.user?._id;
  if (!name) {
    throw new ApiError(400, " Playlist name is required");
  }
  if (!owner) {
    throw new ApiError(401, " Unauthorized req ");
  }
  const playlist = await Playlist.create({
    name: name.trim(),
    description: description.trim() || "",
    owner,
  });
  if (!playlist) {
    throw new ApiError(500, " something went wrong ");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, playlist, " New Playlist is created"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    throw new ApiError(400, " User  Id is required");
  }
  if (!mongoose.isValidObjectId(userId)) {
    throw new ApiError(400, " Not defined user");
  }
  const playlist = await Playlist.find({ owner: userId });

  return res
    .status(200)
    .json(
      200,
      playlist,
      playlist.length ? " Playlist found" : " No playlistFound"
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!playlistId) {
    throw new ApiError(400, " Playlist id is required");
  }
  if (!mongoose.isValidObjectId(playlistId)) {
    throw new ApiError(404, " Unauthorized playlist");
  }
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, " No playlist found ");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, playlist, " Playlist found"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { videoId, playlistId } = req.params;
  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, " Videoid is required");
  }
  if (!mongoose.isValidObjectId(playlistId)) {
    throw new ApiError(400, " PlaylistId is required");
  }
  const video = await Video.findById(videoId);
  const playlist = await Playlist.findById(playlistId);
  if (!video) {
    throw new ApiError(400, " No videos are found");
  }
  if (!playlist) {
    throw new ApiError(400, " No playlists are found");
  }
  const addVideo = Playlist.findByIdAndUpdate(
    {
      $addToSet: {
        videos: videoId,
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video Added successfully"));
});


const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { videoId, playlistId } = req.params;
  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, " Invalid Videoid");
  }
  if (!mongoose.isValidObjectId(playlistId)) {
    throw new ApiError(400, " PlaylistId is required");
  }
  const video = await Video.findById(videoId);
  const playlist = await Playlist.findById(playlistId);
  if (!video) {
    throw new ApiError(404, "  video not found");
  }
  if (!playlist) {
    throw new ApiError(404, " No playlists are found");
  }
  if (playlist.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "You are not allowed to modify this playlist");
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(playlist,{
    $pull:{
        videos:videoId
    }
  },{
    new :true
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updatedPlaylist, " Video Removed successfully"));
});

const deletePlaylist=asyncHandler(async(req,res)=>{
     const { playlistId } = req.params;
 
  if (!mongoose.isValidObjectId(playlistId)) {
    throw new ApiError(400, " PlaylistId is required");
  }
  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, " No playlists are found");
  }
  if (playlist.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "You are not allowed to modify this playlist");
  }
  await Playlist.findByIdAndDelete(playlistId);

  return res.status(200)
  .json(new ApiResponse(200,{}," Playlist deleted successfully"));
})

const updatePlaylist=asyncHandler(async(req,res)=>{
    const{playlistId}=req.params;
    const{name}=req.body
    const{description}=req.body

    if(!mongoose.isValidObjectId(playlistId)){
        throw new ApiError(400," Invalid playlistId ")
    }

    const playlist=await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(404," Playlist not found")
    }

    if (playlist.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "You are not allowed to update this playlist");
}
       const updateFields = {};

    if (name?.trim()) {
        updateFields.name = name.trim();
    }

    if (description?.trim()) {
        updateFields.description = description.trim();
    }
  if (!Object.keys(updateFields).length) {
        throw new ApiError(400, "At least one field is required to update");
    }
   
    return res.status(200)
    .json(new ApiResponse(200,updatedPlaylist," Playlist updated successfully"));

})

export{createPlaylist,getUserPlaylists,
  getPlaylistById,addVideoToPlaylist,removeVideoFromPlaylist,
  deletePlaylist,updatePlaylist
}