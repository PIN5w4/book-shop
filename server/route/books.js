const express  = require('express');
const router = express.Router();
const booksController = require('../controller/books');

router.get('/home',booksController.home);
router.get('/search',booksController.search);
router.get('/get_book_by_id',booksController.getBookById);
router.get('/get_books_table_list',booksController.getBooksTableList);
router.post('/insert_book',booksController.InsertBook);
router.patch('/update_book',booksController.updateBook);

module.exports = router;