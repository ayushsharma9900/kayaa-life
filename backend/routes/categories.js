const express = require('express');
const mongoose = require('mongoose');
const { body, validationResult, query } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const Category = require('../models/Category');
const Product = require('../models/Product');

const router = express.Router();

// Public endpoint for categories (before protect middleware)
// @desc    Get active categories for public use
// @route   GET /api/categories/public
// @access  Public
router.get('/public', [
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().isString().withMessage('Search must be a string')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const limit = parseInt(req.query.limit) || 20;
    const filter = { isActive: true }; // Only return active categories for public
    
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Get active categories with product counts
    const categories = await Category.find(filter)
      .sort({ sortOrder: 1, createdAt: -1 })
      .limit(limit)
      .select('-__v');

    // Get product counts and subcategories for each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const productCount = await Product.countDocuments({
          category: category.name,
          isActive: true
        });
        
        // Get unique subcategories to prevent duplicates
        const subcategories = await Category.find({
          parentId: category._id,
          isActive: true
        })
        .sort({ sortOrder: 1, name: 1 })
        .select('name slug _id isActive')
        .lean();
        
        // Remove any potential duplicates by name
        const uniqueSubcategories = subcategories.filter((sub, index, self) => 
          index === self.findIndex(s => s.name === sub.name)
        );
        
        return {
          ...category.toJSON(),
          productCount,
          subcategories: uniqueSubcategories
        };
      })
    );

    res.json({
      success: true,
      data: categoriesWithCounts
    });
  } catch (error) {
    next(error);
  }
});

// All other routes are protected
router.use(protect);

// Admin routes (must come before parameterized routes)
// @desc    Get all categories for admin (including inactive)
// @route   GET /api/categories/admin/all
// @access  Private (admin and manager only)
router.get('/admin/all', authorize('manager', 'admin'), [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['active', 'inactive']).withMessage('Status must be active or inactive'),
  query('search').optional().isString().withMessage('Search must be a string')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter object (don't filter by isActive for admin)
    const filter = {};
    
    if (req.query.status === 'active') {
      filter.isActive = true;
    } else if (req.query.status === 'inactive') {
      filter.isActive = false;
    }
    
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Get categories with product counts and subcategories
    const categories = await Category.find(filter)
      .sort({ sortOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    // Get product counts and subcategories for each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const productCount = await Product.countDocuments({
          category: category.name
        });
        const activeProductCount = await Product.countDocuments({
          category: category.name,
          isActive: true
        });
        
        // Get subcategories if this is a parent category
        let subcategories = [];
        if (!category.parentId) {
          subcategories = await Category.find({
            parentId: category._id
          })
          .sort({ sortOrder: 1, name: 1 })
          .select('name slug _id isActive')
          .lean();
          
          // Remove duplicates
          subcategories = subcategories.filter((sub, index, self) => 
            index === self.findIndex(s => s.name === sub.name)
          );
        }
        
        return {
          ...category.toJSON(),
          productCount,
          activeProductCount,
          subcategories
        };
      })
    );

    const totalCategories = await Category.countDocuments(filter);
    const totalPages = Math.ceil(totalCategories / limit);

    res.json({
      success: true,
      data: categoriesWithCounts,
      pagination: {
        currentPage: page,
        totalPages,
        totalCategories,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get all categories with pagination and filtering
// @route   GET /api/categories
// @access  Private
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('active').optional().isBoolean().withMessage('Active must be boolean'),
  query('search').optional().isString().withMessage('Search must be a string')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    
    if (req.query.active !== undefined) {
      filter.isActive = req.query.active === 'true';
    }
    
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Get categories with product counts
    const categories = await Category.find(filter)
      .sort({ sortOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    // Get product counts for each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const productCount = await Product.countDocuments({
          category: category.name,
          isActive: true
        });
        return {
          ...category.toJSON(),
          productCount
        };
      })
    );

    const totalCategories = await Category.countDocuments(filter);
    const totalPages = Math.ceil(totalCategories / limit);

    res.json({
      success: true,
      data: categoriesWithCounts,
      pagination: {
        currentPage: page,
        totalPages,
        totalCategories,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Private
router.get('/:id', async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Get product count for this category
    const productCount = await Product.countDocuments({
      category: category.name,
      isActive: true
    });

    res.json({
      success: true,
      data: {
        ...category.toJSON(),
        productCount
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create new category
// @route   POST /api/categories
// @access  Private (manager and admin only)
router.post('/', authorize('manager', 'admin'), [
  body('name').trim().notEmpty().withMessage('Category name is required'),
  body('description').trim().notEmpty().withMessage('Category description is required'),
  body('slug').optional().isString().withMessage('Slug must be a string'),
  body('image').optional().isURL().withMessage('Image must be a valid URL'),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
  body('sortOrder').optional().isInt().withMessage('Sort order must be an integer')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    // Check if category name already exists
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${req.body.name}$`, 'i') }
    });
    
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    const category = await Category.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name or slug already exists'
      });
    }
    next(error);
  }
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (manager and admin only)
router.put('/:id', authorize('manager', 'admin'), [
  body('name').optional().trim().notEmpty().withMessage('Category name cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Category description cannot be empty'),
  body('slug').optional().isString().withMessage('Slug must be a string'),
  body('image').optional().isURL().withMessage('Image must be a valid URL'),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
  body('sortOrder').optional().isInt().withMessage('Sort order must be an integer')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    // Check if name already exists (excluding current category)
    if (req.body.name) {
      const existingCategory = await Category.findOne({
        name: { $regex: new RegExp(`^${req.body.name}$`, 'i') },
        _id: { $ne: req.params.id }
      });
      
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Category with this name already exists'
        });
      }
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Get product count for updated category
    const productCount = await Product.countDocuments({
      category: category.name,
      isActive: true
    });

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: {
        ...category.toJSON(),
        productCount
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name or slug already exists'
      });
    }
    next(error);
  }
});

// @desc    Toggle category active status
// @route   PATCH /api/categories/:id/toggle-status
// @access  Private (manager and admin only)
router.patch('/:id/toggle-status', authorize('manager', 'admin'), async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    category.isActive = !category.isActive;
    await category.save();

    // Get product count for updated category
    const productCount = await Product.countDocuments({
      category: category.name,
      isActive: true
    });

    res.json({
      success: true,
      message: `Category ${category.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        ...category.toJSON(),
        productCount
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private (admin only)
router.delete('/:id', authorize('admin'), async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if category has products
    const productCount = await Product.countDocuments({
      category: category.name
    });

    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It contains ${productCount} products. Please move or delete the products first.`
      });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get subcategories for a category
// @route   GET /api/categories/:id/subcategories
// @access  Private
router.get('/:id/subcategories', async (req, res, next) => {
  try {
    const subcategories = await Category.find({ 
      parentId: req.params.id,
      isActive: true 
    }).sort({ sortOrder: 1, name: 1 });

    res.json({
      success: true,
      data: subcategories
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get category statistics
// @route   GET /api/categories/meta/stats
// @access  Private
router.get('/meta/stats', async (req, res, next) => {
  try {
    const totalCategories = await Category.countDocuments();
    const activeCategories = await Category.countDocuments({ isActive: true });
    
    const categoryStats = await Category.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: 'name',
          foreignField: 'category',
          as: 'products'
        }
      },
      {
        $addFields: {
          productCount: { $size: '$products' },
          activeProducts: {
            $size: {
              $filter: {
                input: '$products',
                cond: { $eq: ['$$this.isActive', true] }
              }
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: '$productCount' },
          totalActiveProducts: { $sum: '$activeProducts' }
        }
      }
    ]);

    const stats = categoryStats[0] || { totalProducts: 0, totalActiveProducts: 0 };

    res.json({
      success: true,
      data: {
        totalCategories,
        activeCategories,
        inactiveCategories: totalCategories - activeCategories,
        totalProducts: stats.totalProducts,
        totalActiveProducts: stats.totalActiveProducts
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Bulk update category status
// @route   PATCH /api/categories/bulk/status
// @access  Private (manager and admin only)
router.patch('/bulk/status', authorize('manager', 'admin'), [
  body('categoryIds').isArray({ min: 1 }).withMessage('Category IDs array is required'),
  body('isActive').isBoolean().withMessage('isActive must be boolean')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { categoryIds, isActive } = req.body;

    const result = await Category.updateMany(
      { _id: { $in: categoryIds } },
      { isActive }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} categories ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update category order
// @route   PATCH /api/categories/bulk/order
// @access  Private (manager and admin only)
router.patch('/bulk/order', authorize('manager', 'admin'), [
  body('categories').isArray({ min: 1 }).withMessage('Categories array is required'),
  body('categories.*.id').notEmpty().withMessage('Category ID is required'),
  body('categories.*.sortOrder').isInt().withMessage('Sort order must be integer')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { categories } = req.body;
    const updates = categories.map(cat => ({
      updateOne: {
        filter: { _id: cat.id },
        update: { sortOrder: cat.sortOrder, updatedAt: new Date() }
      }
    }));

    const result = await Category.bulkWrite(updates);
    console.log('Updated categories order:', result.modifiedCount);

    res.json({
      success: true,
      message: 'Category order updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Bulk delete categories
// @route   DELETE /api/categories/bulk
// @access  Private (admin only)
router.delete('/bulk', authorize('admin'), [
  body('categoryIds').isArray({ min: 1 }).withMessage('Category IDs array is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { categoryIds } = req.body;

    // Check if any categories have products
    const categoriesWithProducts = await Category.aggregate([
      {
        $match: { _id: { $in: categoryIds.map(id => new mongoose.Types.ObjectId(id)) } }
      },
      {
        $lookup: {
          from: 'products',
          localField: 'name',
          foreignField: 'category',
          as: 'products'
        }
      },
      {
        $match: { 'products.0': { $exists: true } }
      }
    ]);

    if (categoriesWithProducts.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete categories that contain products. Found ${categoriesWithProducts.length} categories with products.`,
        data: categoriesWithProducts.map(cat => ({ _id: cat._id, name: cat.name, productCount: cat.products.length }))
      });
    }

    const result = await Category.deleteMany(
      { _id: { $in: categoryIds } }
    );

    res.json({
      success: true,
      message: `${result.deletedCount} categories deleted successfully`,
      data: {
        deletedCount: result.deletedCount
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
