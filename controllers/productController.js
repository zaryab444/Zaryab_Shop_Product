const asyncHandler = require("express-async-handler");
const Product = require("../data/models/productModel.js");
const multer = require("multer");
const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error("Invalid image type");
    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, "public/uploads");
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(" ").join("-");
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});

const uploadOptions = multer({ storage: storage }).single("image");

// @desc     Fetch all products
// @route    GET /api/products
// @access   Public
// http://localhost:5000/api/products

const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({});
  res.json(products);
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
// http://localhost:5000/api/products
const createProduct = asyncHandler(async (req, res) => {
  uploadOptions(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred during file upload
      return res.status(400).send(err.message);
    } else if (err) {
      // An unknown error occurred during file upload
      return res.status(500).send(err.message);
    }

    // File upload is successful, continue with creating the product
    const file = req.file;
    if (!file) {
      return res.status(400).send("No image in the request");
    }

    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;

    let product = new Product({
      name: req.body.name,
      price: req.body.price,
      user: req.user.id,
      image: `${basePath}${fileName}`,
      brand: req.body.brand,
      category: req.body.category,
      countInStock: req.body.countInStock,
      numReviews: req.body.numReviews,
      description: req.body.description,
    });
    product = await product.save();
    res.status(200).json(product);
  });
});

// @desc     Fetch single products
// @route    GET /api/products:id
// @access   Public
// http://localhost:5000/api/products/_id
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req?.params?.id);

  if (product) {
    return res.json(product);
  } else {
    res.status(404);
    throw new Error("Resource not found");
  }
});

// @desc     Update a product
// @route    PUT /api/products/:id
// @access   Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  // const { name, price, description, image, brand, category, countInStock } =
  //   req.body;

  // const product = await Product.findById(req.params.id);

  // if (product) {
  //   product.name = name;
  //   product.price = price;
  //   product.description = description;
  //   product.image = image;
  //   product.brand = brand;
  //   product.category = category;
  //   product.countInStock = countInStock;

  //   const updatedProduct = await product.save();
  //   res.json(updatedProduct);
  // } else {
  //   res.status(404);
  //   throw new Error("Resource not found");
  // }
  uploadOptions(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred during file upload
      return res.status(400).send(err.message);
    } else if (err) {
      // An unknown error occurred during file upload
      return res.status(500).send(err.message);
    }

    // File upload is successful, continue with creating the product
    const file = req.file;
    if (!file) {
      return res.status(400).send("No image in the request");
    }

    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
    const { name, price, description, image, brand, category, countInStock } =
    req.body;
    const product = await Product.findById(req.params.id);
  if (product) {
    product.name = name;
    product.price = price;
    product.description = description;
    product.image = `${basePath}${fileName}`,
    product.brand = brand;
    product.category = category;
    product.countInStock = countInStock;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error("Resource not found");
  }
  });
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await Product.deleteOne({ _id: product._id });
    res.json({ message: "Product removed" });
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

// @desc   Create a new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (product) {
   const alreadyReviewed = product.reviews.find(
    (review) => review.user.toString() === req.user.id.toString()
   );

   if(alreadyReviewed){
    res.status(400);
    throw new Error('Product already reviewed');
   }
   const review = {
    name: req.user.name,
    rating: Number(rating),
    comment,
    user: req.user._id
   };
   product.reviews.push(review);
   product.numReviews = product.reviews.length;

   product.rating = product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length;
   await product.save();
   res.status(200).json({message: 'Review added'});
  } else {
    res.status(404);
    throw new Error("Resource not found");
  }
});

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview
};
