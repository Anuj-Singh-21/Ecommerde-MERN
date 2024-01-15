const { Product } = require('../model/Product');

exports.createProduct = async (req, res) => {
  // this product we have to get from API body
  const product = new Product(req.body);
  product.discountPrice = Math.round(product.price*(1-product.discountPercentage/100))
  try {
    const doc = await product.save();
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json(err);
  }
};

// exports.fetchAllProducts = async (req, res) => {
//   let condition = {};

//   if (!req.query.admin) {
//     condition.deleted = { $ne: true };
//   }

//   let query = Product.find(condition);
//   let totalProductsQuery = Product.find(condition);

//   if (req.query.category) {
//     query = query.find({ category: { $in: req.query.category.split(',') } });
//     totalProductsQuery = totalProductsQuery.find({
//       category: { $in: req.query.category.split(',') },
//     });
//   }

//   if (req.query.brand) {
//     query = query.find({ brand: { $in: req.query.brand.split(',') } });
//     totalProductsQuery = totalProductsQuery.find({
//       brand: { $in: req.query.brand.split(',') },
//     });
//   }

//   if (req.query._sort && req.query._order) {
//     const sortField = req.query._sort;
//     const sortOrder = req.query._order === 'desc' ? -1 : 1;

//     const sortObject = {};
//     sortObject[sortField] = sortOrder;

//     query = query.sort(sortObject);
//   }

//   const totalDocs = await totalProductsQuery.count().exec();

//   if (req.query._page && req.query._limit) {
//     const pageSize = req.query._limit;
//     const page = req.query._page;
//     query = query.skip(pageSize * (page - 1)).limit(pageSize);
//   }

//   try {
//     const docs = await query.exec();
//     res.set('X-Total-Count', totalDocs);
//     res.status(200).json(docs);
//   } catch (err) {
//     res.status(400).json(err);
//   }
// };


exports.fetchAllProducts = async (req, res) => {
  let condition = {};

  if (!req.query.admin) {
    condition.deleted = { $ne: true };
  }

  let query = Product.find(condition);
  let totalProductsQuery = Product.find(condition);

  // Add this block to handle search queries
  if (req.query.q) {
    const searchQuery = new RegExp(req.query.q, 'i'); // 'i' makes it case insensitive
    query = query.find({ name: searchQuery });
    totalProductsQuery = totalProductsQuery.find({ name: searchQuery });
  }

  // existing code...
  if (req.query.category) {
        query = query.find({ category: { $in: req.query.category.split(',') } });
        totalProductsQuery = totalProductsQuery.find({
          category: { $in: req.query.category.split(',') },
        });
      }
    
      if (req.query.brand) {
        query = query.find({ brand: { $in: req.query.brand.split(',') } });
        totalProductsQuery = totalProductsQuery.find({
          brand: { $in: req.query.brand.split(',') },
        });
      }
    
      if (req.query._sort && req.query._order) {
        const sortField = req.query._sort;
        const sortOrder = req.query._order === 'desc' ? -1 : 1;
    
        const sortObject = {};
        sortObject[sortField] = sortOrder;
    
        query = query.sort(sortObject);
      }
    
      const totalDocs = await totalProductsQuery.count().exec();
    
      if (req.query._page && req.query._limit) {
        const pageSize = req.query._limit;
        const page = req.query._page;
        query = query.skip(pageSize * (page - 1)).limit(pageSize);
      }

  try {
    const docs = await query.exec();
    res.set('X-Total-Count', totalDocs);
    res.status(200).json(docs);
  } catch (err) {
    res.status(400).json(err);
  }
};


exports.fetchProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id);
    res.status(200).json(product);
  } catch (err) {
    res.status(400).json(err);
  }
};

exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findByIdAndUpdate(id, req.body, {new:true});
    product.discountPrice = Math.round(product.price*(1-product.discountPercentage/100))
    const updatedProduct = await product.save()
    res.status(200).json(updatedProduct);
  } catch (err) {
    res.status(400).json(err);
  }
};


