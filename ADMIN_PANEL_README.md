# Admin Panel Documentation

## Overview

A complete admin panel has been created for managing the Hijabi Inoor e-commerce website. The admin panel includes:

- **Authentication System** - Secure login with Supabase
- **Dashboard** - Overview statistics and metrics
- **Products Management** - Full CRUD operations for products
- **Orders Management** - View and manage customer orders
- **Categories Management** - Manage product categories
- **Settings** - Configure store settings

## Setup Instructions

### 1. Supabase Configuration

The admin panel uses Supabase for authentication and data management. You need to:

1. Create a Supabase project at https://supabase.com
2. Create an `.env.local` file in the root directory:
   ```
   VITE_SUPABASE_URL=your-supabase-project-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

### 2. Database Setup

Create the following tables in your Supabase database:

#### Admin Users Table
```sql
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Products Table (if using database)
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_ar TEXT,
  name_fr TEXT,
  name_it TEXT,
  name_es TEXT,
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  image TEXT,
  images TEXT[],
  category TEXT NOT NULL,
  subcategory TEXT,
  description TEXT,
  description_ar TEXT,
  description_fr TEXT,
  description_it TEXT,
  description_es TEXT,
  colors TEXT[],
  sizes TEXT[],
  in_stock BOOLEAN DEFAULT true,
  is_new BOOLEAN DEFAULT false,
  new_arrival BOOLEAN DEFAULT false,
  is_best_seller BOOLEAN DEFAULT false,
  is_on_sale BOOLEAN DEFAULT false,
  rating DECIMAL(3, 2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Orders Table
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  subtotal DECIMAL(10, 2) NOT NULL,
  shipping_cost DECIMAL(10, 2) NOT NULL,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  shipping_address JSONB NOT NULL,
  billing_address JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Row Level Security (RLS)

Enable RLS and create policies for admin access:

```sql
-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Admin users can only see their own record
CREATE POLICY "Admin users can view own record"
  ON admin_users FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can manage all products
CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Admins can view all orders
CREATE POLICY "Admins can view orders"
  ON orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );
```

## Accessing the Admin Panel

1. Navigate to `/admin/login`
2. Login with your admin credentials
3. You'll be redirected to `/admin/dashboard`

## Admin Panel Features

### Dashboard (`/admin/dashboard`)
- Overview statistics (products, orders, revenue, users)
- Low stock alerts
- Recent orders
- Activity feed

### Products Management (`/admin/products`)
- View all products in a table
- Search and filter products
- Edit product details
- Delete products
- Add new products (route: `/admin/products/new`)

### Orders Management (`/admin/orders`)
- View all orders
- Filter by status
- View order details
- Update order status
- Track shipments

### Categories Management (`/admin/categories`)
- View all categories
- Add new categories
- Edit categories
- Delete categories

### Settings (`/admin/settings`)
- General store information
- Shipping settings
- Payment methods configuration

## File Structure

```
src/
├── components/
│   ├── admin/
│   │   ├── AdminLayout.tsx      # Main admin layout with sidebar
│   │   └── AdminSidebar.tsx      # Sidebar navigation
│   └── ui/                       # Reusable UI components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── table.tsx
│       └── badge.tsx
├── contexts/
│   └── AuthContext.tsx           # Authentication context
├── lib/
│   ├── supabase.ts               # Supabase client
│   └── utils.ts                  # Utility functions
└── pages/
    └── admin/
        ├── AdminPage.tsx          # Admin route wrapper
        ├── AdminLogin.tsx         # Login page
        ├── AdminDashboard.tsx     # Dashboard
        ├── AdminProducts.tsx      # Products management
        ├── AdminOrders.tsx        # Orders list
        ├── AdminOrderDetail.tsx   # Order details
        ├── AdminCategories.tsx     # Categories management
        └── AdminSettings.tsx      # Settings page
```

## Customization

### Adding New Admin Pages

1. Create a new component in `src/pages/admin/`
2. Add the route in `src/App.tsx`:
   ```tsx
   <Route path="your-route" element={<YourComponent />} />
   ```
3. Add navigation item in `src/components/admin/AdminSidebar.tsx`

### Styling

The admin panel uses Tailwind CSS. You can customize:
- Colors in `tailwind.config.js`
- Component styles in individual component files
- Global styles in `src/index.css`

## Security Notes

1. **Authentication**: All admin routes are protected by the `AdminLayout` component
2. **Authorization**: The `isAdmin` check verifies the user is in the `admin_users` table
3. **Environment Variables**: Never commit `.env.local` to version control
4. **RLS Policies**: Ensure proper Row Level Security policies are set in Supabase

## Troubleshooting

### Blank Page After Login
- Check browser console for errors
- Verify Supabase credentials in `.env.local`
- Ensure the user exists in `admin_users` table

### Build Errors
- Run `npm install` to ensure all dependencies are installed
- Check TypeScript errors: `npm run build`
- Verify all imports are correct

### Authentication Issues
- Verify Supabase project is active
- Check RLS policies are correctly configured
- Ensure admin user is created in `admin_users` table

## Next Steps

1. **Connect to Real Database**: Replace mock data with actual Supabase queries
2. **Add Product Images Upload**: Implement image upload functionality
3. **Add Analytics**: Integrate analytics for better insights
4. **Add Email Notifications**: Notify admins of new orders
5. **Add Export Features**: Export orders/products to CSV/Excel

## Support

For issues or questions, please refer to:
- Supabase Documentation: https://supabase.com/docs
- React Query Documentation: https://tanstack.com/query
- React Router Documentation: https://reactrouter.com

