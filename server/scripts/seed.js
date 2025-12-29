import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

// Import models
import User from '../models/User.js';
import Category from '../models/Category.js';
import Food from '../models/Food.js';
import Table from '../models/Table.js';
import Discount from '../models/Discount.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/spicyhunt';

async function seedDatabase() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // ============ SEED USERS ============
        console.log('\n📝 Seeding Users...');

        const hashedPassword = await bcrypt.hash('Admin@123', 10);

        const users = [
            {
                fullName: 'Quản trị viên',
                username: 'admin',
                password: hashedPassword,
                email: 'admin@spicyhunt.com',
                phoneNumber: '0900000001',
                role: 'ADMIN',
                state: 'ACTIVE'
            },
            {
                fullName: 'Quản lý nhà hàng',
                username: 'manager',
                password: hashedPassword,
                email: 'manager@spicyhunt.com',
                phoneNumber: '0900000002',
                role: 'MANAGER',
                state: 'ACTIVE'
            },
            {
                fullName: 'Nhân viên phục vụ',
                username: 'staff',
                password: hashedPassword,
                email: 'staff@spicyhunt.com',
                phoneNumber: '0900000003',
                role: 'STAFF',
                state: 'ACTIVE'
            },
            {
                fullName: 'Khách hàng VIP',
                username: 'customer1',
                password: hashedPassword,
                email: 'customer1@gmail.com',
                phoneNumber: '0901234567',
                role: 'CUSTOMER',
                state: 'ACTIVE'
            }
        ];

        for (const userData of users) {
            const existingUser = await User.findOne({ username: userData.username });
            if (existingUser) {
                await User.findByIdAndUpdate(existingUser._id, userData);
                console.log(`  ✅ Updated user: ${userData.username} (${userData.role})`);
            } else {
                await User.create(userData);
                console.log(`  ✅ Created user: ${userData.username} (${userData.role})`);
            }
        }

        // ============ SEED CATEGORIES ============
        console.log('\n📝 Seeding Categories...');

        const categoriesData = [
            { name: 'Món chính', nameEN: 'Main Dishes', description: 'Các món ăn chính đậm đà hương vị', descriptionEN: 'Flavorful main courses', imgUrl: '/images/categories/main.jpg', order: 1 },
            { name: 'Món khai vị', nameEN: 'Appetizers', description: 'Các món khai vị thơm ngon', descriptionEN: 'Delicious starters', imgUrl: '/images/categories/appetizer.jpg', order: 2 },
            { name: 'Đồ uống', nameEN: 'Beverages', description: 'Thức uống giải khát', descriptionEN: 'Refreshing drinks', imgUrl: '/images/categories/drinks.jpg', order: 3 },
            { name: 'Tráng miệng', nameEN: 'Desserts', description: 'Các món tráng miệng hấp dẫn', descriptionEN: 'Sweet desserts', imgUrl: '/images/categories/dessert.jpg', order: 4 },
            { name: 'Món nướng', nameEN: 'Grilled Dishes', description: 'Các món nướng cay nồng', descriptionEN: 'Spicy grilled dishes', imgUrl: '/images/categories/grilled.jpg', order: 5 },
        ];

        await Category.deleteMany({});
        const categories = await Category.insertMany(categoriesData);
        console.log(`  ✅ Inserted ${categories.length} categories`);

        // Map category names to IDs
        const categoryMap = {};
        categories.forEach(cat => {
            categoryMap[cat.name] = cat._id;
        });

        // ============ SEED FOODS ============
        console.log('\n📝 Seeding Foods...');

        const foodsData = [
            // Món chính
            { name: 'Gà cay Hàn Quốc', nameEN: 'Korean Spicy Chicken', description: 'Gà chiên giòn tẩm sốt cay Hàn Quốc', descriptionEN: 'Crispy fried chicken with Korean spicy sauce', price: 159000, categoryId: categoryMap['Món chính'], imgUrl: '/images/foods/korean-chicken.jpg', isMain: true, quantity: 100 },
            { name: 'Mì cay cấp độ 7', nameEN: 'Level 7 Spicy Noodles', description: 'Mì cay nồng đậm đà', descriptionEN: 'Extreme spicy noodles', price: 79000, categoryId: categoryMap['Món chính'], imgUrl: '/images/foods/spicy-noodles.jpg', isMain: true, quantity: 50 },
            { name: 'Cơm chiên kim chi', nameEN: 'Kimchi Fried Rice', description: 'Cơm chiên với kim chi Hàn Quốc', descriptionEN: 'Fried rice with Korean kimchi', price: 89000, categoryId: categoryMap['Món chính'], imgUrl: '/images/foods/kimchi-rice.jpg', isMain: true, quantity: 80 },
            { name: 'Tokbokki hải sản', nameEN: 'Seafood Tteokbokki', description: 'Bánh gạo cay với hải sản tươi', descriptionEN: 'Spicy rice cakes with fresh seafood', price: 129000, categoryId: categoryMap['Món chính'], imgUrl: '/images/foods/tokbokki.jpg', isMain: true, quantity: 60 },

            // Món khai vị
            { name: 'Cánh gà chiên mắm', nameEN: 'Fish Sauce Wings', description: 'Cánh gà chiên giòn sốt mắm tỏi', descriptionEN: 'Crispy wings with fish sauce', price: 89000, categoryId: categoryMap['Món khai vị'], imgUrl: '/images/foods/fish-sauce-wings.jpg', quantity: 70 },
            { name: 'Kimbap truyền thống', nameEN: 'Traditional Kimbap', description: 'Cơm cuộn rong biển kiểu Hàn', descriptionEN: 'Korean seaweed rice rolls', price: 59000, categoryId: categoryMap['Món khai vị'], imgUrl: '/images/foods/kimbap.jpg', quantity: 40 },
            { name: 'Bánh xèo giòn', nameEN: 'Crispy Pancake', description: 'Bánh xèo giòn nhân thịt tôm', descriptionEN: 'Crispy Vietnamese pancake', price: 69000, categoryId: categoryMap['Món khai vị'], imgUrl: '/images/foods/banh-xeo.jpg', quantity: 35 },

            // Đồ uống
            { name: 'Trà đào cam sả', nameEN: 'Peach Lemongrass Tea', description: 'Trà thơm mát giải nhiệt', descriptionEN: 'Refreshing peach lemongrass tea', price: 39000, categoryId: categoryMap['Đồ uống'], imgUrl: '/images/foods/peach-tea.jpg', quantity: 100 },
            { name: 'Sinh tố xoài', nameEN: 'Mango Smoothie', description: 'Sinh tố xoài tươi ngọt', descriptionEN: 'Fresh mango smoothie', price: 45000, categoryId: categoryMap['Đồ uống'], imgUrl: '/images/foods/mango-smoothie.jpg', quantity: 80 },
            { name: 'Soju đào', nameEN: 'Peach Soju', description: 'Soju vị đào nhập khẩu Hàn Quốc', descriptionEN: 'Korean peach flavored soju', price: 89000, categoryId: categoryMap['Đồ uống'], imgUrl: '/images/foods/peach-soju.jpg', quantity: 50 },
            { name: 'Coca Cola', nameEN: 'Coca Cola', description: 'Nước ngọt có gas', descriptionEN: 'Carbonated soft drink', price: 20000, categoryId: categoryMap['Đồ uống'], imgUrl: '/images/foods/coca.jpg', quantity: 200 },

            // Tráng miệng
            { name: 'Bingsu Dâu Tây', nameEN: 'Strawberry Bingsu', description: 'Đá bào Hàn Quốc vị dâu tây', descriptionEN: 'Korean shaved ice with strawberry', price: 79000, categoryId: categoryMap['Tráng miệng'], imgUrl: '/images/foods/strawberry-bingsu.jpg', quantity: 30 },
            { name: 'Bánh Hotteok', nameEN: 'Hotteok', description: 'Bánh rán nhân đường quế', descriptionEN: 'Korean sweet pancake', price: 35000, categoryId: categoryMap['Tráng miệng'], imgUrl: '/images/foods/hotteok.jpg', quantity: 40 },

            // Món nướng
            { name: 'Thịt ba chỉ nướng', nameEN: 'Grilled Pork Belly', description: 'Ba chỉ nướng Hàn Quốc đậm đà', descriptionEN: 'Korean style grilled pork belly', price: 199000, categoryId: categoryMap['Món nướng'], imgUrl: '/images/foods/pork-belly.jpg', isMain: true, quantity: 45 },
            { name: 'Bò nướng Bulgogi', nameEN: 'Bulgogi', description: 'Thịt bò ướp sốt ngọt nướng', descriptionEN: 'Marinated grilled beef', price: 229000, categoryId: categoryMap['Món nướng'], imgUrl: '/images/foods/bulgogi.jpg', isMain: true, quantity: 40 },
            { name: 'Set nướng hỗn hợp', nameEN: 'Mixed BBQ Set', description: 'Set nướng gồm thịt bò, heo, gà', descriptionEN: 'BBQ set with beef, pork, chicken', price: 399000, categoryId: categoryMap['Món nướng'], imgUrl: '/images/foods/bbq-set.jpg', isMain: true, quantity: 20 },
        ];

        await Food.deleteMany({});
        const foods = await Food.insertMany(foodsData);
        console.log(`  ✅ Inserted ${foods.length} foods`);

        // ============ SEED TABLES ============
        console.log('\n📝 Seeding Tables...');

        const tablesData = [
            { name: 'Bàn 1', numberOfChair: 2, state: 'ACTIVE' },
            { name: 'Bàn 2', numberOfChair: 4, state: 'ACTIVE' },
            { name: 'Bàn 3', numberOfChair: 4, state: 'ACTIVE' },
            { name: 'Bàn 4', numberOfChair: 6, state: 'ACTIVE' },
            { name: 'Bàn 5', numberOfChair: 6, state: 'ACTIVE' },
            { name: 'Bàn 6', numberOfChair: 8, state: 'ACTIVE' },
            { name: 'Bàn VIP 1', numberOfChair: 10, state: 'ACTIVE' },
            { name: 'Bàn VIP 2', numberOfChair: 12, state: 'ACTIVE' },
            { name: 'Bàn Ngoài 1', numberOfChair: 4, state: 'ACTIVE' },
            { name: 'Bàn Ngoài 2', numberOfChair: 4, state: 'INACTIVE' },
        ];

        await Table.deleteMany({});
        const tables = await Table.insertMany(tablesData);
        console.log(`  ✅ Inserted ${tables.length} tables`);

        // ============ SEED DISCOUNTS ============
        console.log('\n📝 Seeding Discounts...');

        const now = new Date();
        const next30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const next60Days = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

        const discountsData = [
            { name: 'Giảm 10% đơn 200K', description: 'Giảm 10% cho đơn hàng từ 200.000đ', discountPercent: 10, discountAmount: 0, minTotalPrice: 200000, maxDiscount: 50000, startDate: now, endDate: next30Days, status: 'ACTIVE' },
            { name: 'Giảm 50K đơn 500K', description: 'Giảm trực tiếp 50.000đ cho đơn từ 500.000đ', discountPercent: 0, discountAmount: 50000, minTotalPrice: 500000, maxDiscount: 50000, startDate: now, endDate: next30Days, status: 'ACTIVE' },
            { name: 'Giảm 20% cuối tuần', description: 'Giảm 20% vào thứ 7, Chủ nhật', discountPercent: 20, discountAmount: 0, minTotalPrice: 300000, maxDiscount: 100000, startDate: now, endDate: next60Days, status: 'ACTIVE' },
            { name: 'Flash Sale 30%', description: 'Giảm 30% trong khung giờ vàng', discountPercent: 30, discountAmount: 0, minTotalPrice: 150000, maxDiscount: 80000, startDate: now, endDate: next30Days, status: 'ACTIVE' },
            { name: 'Khuyến mãi hết hạn', description: 'Chương trình đã kết thúc', discountPercent: 15, discountAmount: 0, minTotalPrice: 100000, maxDiscount: 30000, startDate: new Date('2024-01-01'), endDate: new Date('2024-12-31'), status: 'INACTIVE' },
        ];

        await Discount.deleteMany({});
        const discounts = await Discount.insertMany(discountsData);
        console.log(`  ✅ Inserted ${discounts.length} discounts`);

        // ============ SUMMARY ============
        console.log('\n🎉 ========== SEED COMPLETED ==========');
        console.log(`   Users: ${users.length}`);
        console.log(`   Categories: ${categories.length}`);
        console.log(`   Foods: ${foods.length}`);
        console.log(`   Tables: ${tables.length}`);
        console.log(`   Discounts: ${discounts.length}`);
        console.log('\n📋 Test Accounts:');
        console.log('   👤 Admin: admin / Admin@123');
        console.log('   👤 Manager: manager / Admin@123');
        console.log('   👤 Staff: staff / Admin@123');
        console.log('   👤 Customer: customer1 / Admin@123');
        console.log('=====================================\n');

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
}

seedDatabase();
