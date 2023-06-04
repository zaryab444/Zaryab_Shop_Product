const asyncHandler = require("express-async-handler");
const User = require("../data/models/userModel");

//@desc Login user
//route POST /api/users/login
//@access Public
//api http://localhost:5000/api/users/login
const authUser = asyncHandler(async (req, res) => {
  const {email, password} = req.body;
  const user = await User.findOne({email});
  if(user && (await user.matchPassword(password))){
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin
    })
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
  res.send("auth user");
});

//@desc Register user
//route POST /api/users
//@access Public
//api http://localhost:5000/api/users
const registerUser = asyncHandler(async (req, res) => {
  res.send("register user");
});

//@desc Logout user / clear cookie
//route POST /api/users/logout
//@access Private
//api http://localhost:5000/api/users/logout
const logoutUser = asyncHandler(async (req, res) => {
  res.send("logout user");
});

//@desc Get user profile
//route GET /api/users/profile
//@access Private
//api http://localhost:5000/api/users/profile
const getUserProfile = asyncHandler(async (req, res) => {
  res.send("get user profile");
});

//@desc Update user profile
//route put /api/users/profile
//@access Private
//api http://localhost:5000/api/users/profile
const updateUserProfile = asyncHandler(async (req, res) => {
  res.send("update user profile");
});

//@desc Get users
//route GET /api/users
//@access Private/Admin
//api http://localhost:5000/api/users
const getUsers = asyncHandler(async (req, res) => {
  res.send("get users");
});

//@desc DELETE users
//route DELETE /api/users/:id
//@access Private/Admin
//api http://localhost:5000/api/users/1
const deleteUser = asyncHandler(async (req, res) => {
  res.send("delete users");
});

//@desc GET user by ID
//route GET /api/users/:id
//@access Private/Admin
//api http://localhost:5000/api/users/1
const getUserByID = asyncHandler(async (req, res) => {
  res.send("get user by id");
});

//@desc Update ser
//route PUT /api/users/:id
//@access Private/Admin
//http://localhost:5000/api/users/1
const updateUser = asyncHandler(async (req, res) => {
  res.send("update user");
});

module.exports = {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserByID,
  updateUser
};