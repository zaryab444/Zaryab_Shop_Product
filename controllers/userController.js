const asyncHandler = require("express-async-handler");
const User = require("../data/models/userModel");
const generateToken = require("../utils/generateToken");
const jwt = require('jsonwebtoken');

//@desc Login user
//route POST /api/users/login
//@access Public
//api http://localhost:5000/api/users/login
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    const token = jwt.sign(
      {
          userId: user.id,
          //admin user can only use the token to process operation not user
          isAdmin: user.isAdmin
      },
      process.env.
      JWT_SECRET,
      {expiresIn : '1d'}
  ) 
  res.status(200).send({user: user.email , token: token}) 
    // generateToken(res, user._id);
    // res.status(200).json({
    //   // _id: user._id,
    //   // name: user.name,
    //   // email: user.email,
    //   // isAdmin: user.isAdmin,
    //   message: "User Login Successfully",
    //   isAdmin: user.isAdmin,
    //   token: res.token
    // });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
  res.send("auth user");
});

//@desc Register user
//route POST /api/users
//@access Public
//api http://localhost:5000/api/users
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const userExist = await User.findOne({ email });

  if (userExist) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    generateToken(res, user._id);
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

//@desc Logout user / clear cookie
//route POST /api/users/logout
//@access Private
//api http://localhost:5000/api/users/logout
const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({
    message: "Logged out successfully",
  });
});

//@desc Get user profile
//route GET /api/users/profile
//@access Private
//api http://localhost:5000/api/users/profile
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

//@desc Update user profile
//route put /api/users/profile
//@access Private
//api http://localhost:5000/api/users/profile
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    /**
     * the reason of doing this because password 
    is hash in store in database
     * */
    if (req.body.password) {
      user.password = req.body.password;
    }
    const updateUser = await user.save();
    res.status(200).json({
      _id: updateUser._id,
      name: updateUser.name,
      email: updateUser.email,
      isAdmin: updateUser.isAdmin
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

//@desc Get users
//route GET /api/users
//@access Private/Admin
//api http://localhost:5000/api/users
const getUsers = asyncHandler(async (req, res) => {
 const users = await User.find({});
 res.status(200).json(users);
});

//@desc DELETE users
//route DELETE /api/users/:id
//@access Private/Admin
//api http://localhost:5000/api/users/1
const deleteUser = asyncHandler(async (req, res) => {
 const user = await User.findById(req.params.id);

 if(user){
  if(user.isAdmin){
    res.status(400);
    throw new Error('Cannot admin user');
  }
  await User.deleteOne({_id: user._id})
  res.status(200).json({message: 'User deleted successfully'});
 }
 else {
  res.status(404);
  throw new Error('User not found');
 }
});

//@desc GET user by ID
//route GET /api/users/:id
//@access Private/Admin
//api http://localhost:5000/api/users/1
const getUserByID = asyncHandler(async (req, res) => {
const user = await User.findById(req.params.id).select('-password');

if(user){
  res.status(200).json(user);
} else {
  res.status(404);
  throw new Error('User not found');
}
});

//@desc Update ser
//route PUT /api/users/:id
//@access Private/Admin
//http://localhost:5000/api/users/1
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if(user){
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.isAdmin = Boolean(req.body.isAdmin);

    const updateUser = await user.save();
    res.status(200).json({
      _id:updateUser._id,
      name: updateUser.name,
      email: updateUser.email,
      isAdmin: updateUser.isAdmin
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
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
  updateUser,
};
