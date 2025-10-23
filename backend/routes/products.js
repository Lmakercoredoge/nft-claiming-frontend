import express from 'express';
import { 
  getAllProducts, 
  getProductById, 
  getProductsByCategory, 
  getFeaturedProducts 
} from '../db/database.js';
import { applyFilters, paginate } from '../utils/productFilters.js';

const router = express.Router();

// 모든 상품 조회 (검색 & 필터 지원)
router.get('/', async (req, res) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      nftDiscount,
      featured,
      inStock,
      size,
      tags,
      sortBy,
      page,
      perPage,
    } = req.query;

    // 모든 상품 조회
    let products = await getAllProducts();

    // 필터 적용
    const filters = {
      search,
      category: category && category !== 'all' ? category : null,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      nftDiscount: nftDiscount === 'true',
      featured: featured === 'true',
      inStock: inStock === 'true',
      size,
      tags: tags ? tags.split(',') : [],
      sortBy: sortBy || 'newest',
    };

    products = applyFilters(products, filters);

    // 페이지네이션
    const pageNum = parseInt(page) || 1;
    const perPageNum = parseInt(perPage) || 12;
    const result = paginate(products, pageNum, perPageNum);

    res.json({
      success: true,
      products: result.items,
      pagination: result.pagination,
      filters: {
        applied: Object.keys(filters).filter(key => filters[key]),
        total: products.length,
      },
    });
  } catch (error) {
    console.error('❌ Products get error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
});

// 상품 상세 조회
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await getProductById(id);
    
    if (!product) {
      return res.status(404).json({ error: '상품을 찾을 수 없습니다' });
    }
    
    res.json({ success: true, product });
  } catch (error) {
    console.error('❌ Product detail error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
});

// 카테고리별 상품 조회
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const products = await getProductsByCategory(category);
    res.json({ success: true, products });
  } catch (error) {
    console.error('❌ Products by category error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
});

// Featured 상품 조회
router.get('/featured/list', async (req, res) => {
  try {
    const products = await getFeaturedProducts();
    res.json({ success: true, products });
  } catch (error) {
    console.error('❌ Featured products error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
});

export default router;
