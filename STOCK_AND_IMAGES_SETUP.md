# Stock Quantity and Multiple Images Setup Guide

## ✅ What's Been Added

### 1. Stock Quantity Management
- Added `stock_quantity` column to products table
- Stock automatically decrements by 1 when an order is placed
- Stock automatically restores when an order is cancelled
- `in_stock` is automatically calculated from `stock_quantity > 0`

### 2. Multiple Images Support
- Products can now have up to 3 images
- First image is the main image (displayed in listings)
- All 3 images are stored in the `images` array

## 📋 SQL Script Setup

### Step 1: Run the SQL Script

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on **SQL Editor** in the left menu
4. Click **New Query**
5. Copy and paste the entire contents of `scripts/add-stock-quantity-and-images.sql`
6. Click **Run** (or press Ctrl+Enter)

This script will:
- ✅ Add `stock_quantity` column if it doesn't exist
- ✅ Ensure `images` column supports arrays
- ✅ Create function to decrement stock on order
- ✅ Create trigger to automatically decrement stock
- ✅ Create function to restore stock on cancellation
- ✅ Create trigger to restore stock when order is cancelled
- ✅ Add constraint to prevent negative stock
- ✅ Create index for faster stock queries
- ✅ Create view for low stock products

### Step 2: Update Existing Products (Optional)

If you have existing products, you may want to set their stock quantities:

```sql
-- Set all existing products to have 50 items in stock
UPDATE products 
SET stock_quantity = 50, in_stock = true
WHERE stock_quantity IS NULL OR stock_quantity = 0;
```

## 🎨 Admin Panel Updates

### Stock Quantity Input
- In the admin product edit page, you'll now see a **"Quantité en stock"** input field
- Enter the number of pieces available (e.g., 50)
- The product will automatically be marked as "in stock" if quantity > 0
- Stock decreases by 1 automatically when someone orders

### Multiple Images Upload
- You can now upload **up to 3 images** per product
- Image 1 is the main image (displayed in product listings)
- Images 2 and 3 are additional images (displayed on product detail page)
- Each image can be uploaded as a file or entered as a URL

## 🔄 How Stock Decrement Works

### Automatic Stock Management

When an order is placed:
1. Order is created in `orders` table
2. Order items are inserted into `order_items` table
3. **Trigger automatically fires** and decrements `stock_quantity` by the quantity ordered
4. If stock goes to 0, `in_stock` is automatically set to `false`

When an order is cancelled:
1. Order status is updated to `'cancelled'`
2. **Trigger automatically fires** and restores stock for all items in that order
3. `in_stock` is automatically set to `true` if stock > 0

### Example

```sql
-- Product has 50 items in stock
-- Customer orders 2 items
-- After order: stock_quantity = 48, in_stock = true

-- If customer cancels order
-- After cancellation: stock_quantity = 50, in_stock = true
```

## 📊 Low Stock View

A view has been created to easily see products with low stock:

```sql
SELECT * FROM products_low_stock;
```

This shows all products with less than 10 items remaining.

## 🛠️ Code Changes

### TypeScript Types
- `Product` interface now includes `stockQuantity: number`
- `images` array supports up to 3 images

### Product Service
- `mapSupabaseProductToProduct()` now maps `stock_quantity` and calculates `in_stock`
- `saveProduct()` now saves `stock_quantity` and limits `images` to 3 items

### Admin Panel
- `AdminProductEdit` now has:
  - Stock quantity input field
  - 3 image upload fields (instead of 1)
  - Automatic image array management

## ⚠️ Important Notes

1. **Stock Validation**: The system prevents negative stock. If someone tries to order more than available, the order will fail with an error message.

2. **Order Creation**: Make sure your checkout process creates orders in the `orders` and `order_items` tables. The triggers will automatically handle stock decrement.

3. **Existing Products**: After running the SQL script, existing products will have `stock_quantity = 0` by default. Update them in the admin panel or via SQL.

4. **Image Limits**: The system enforces a maximum of 3 images per product. If you try to add more, only the first 3 will be saved.

## 🧪 Testing

1. **Test Stock Decrement**:
   - Create a product with `stock_quantity = 10`
   - Place an order for 2 items
   - Check that `stock_quantity` is now 8

2. **Test Stock Restoration**:
   - Cancel the order
   - Check that `stock_quantity` is back to 10

3. **Test Multiple Images**:
   - Create/edit a product
   - Upload 3 different images
   - Verify all 3 images are saved and displayed

4. **Test Negative Stock Prevention**:
   - Create a product with `stock_quantity = 1`
   - Try to order 2 items
   - Should fail with "Insufficient stock" error

## 📝 Next Steps

1. ✅ Run the SQL script in Supabase
2. ✅ Update existing products with stock quantities
3. ✅ Test order creation to verify stock decrement
4. ✅ Test order cancellation to verify stock restoration
5. ✅ Update product images to use the new 3-image system

## 🆘 Troubleshooting

### Stock not decrementing?
- Make sure the SQL script was run successfully
- Check that triggers exist: `SELECT * FROM pg_trigger WHERE tgname LIKE '%stock%';`
- Verify order_items are being inserted correctly

### Images not saving?
- Check that `images` column exists and is type `TEXT[]`
- Verify RLS policies allow INSERT/UPDATE on products table
- Check browser console for errors

### Negative stock?
- The constraint should prevent this, but if it happens:
  ```sql
  UPDATE products SET stock_quantity = 0 WHERE stock_quantity < 0;
  ```








