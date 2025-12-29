import Order from '../models/Order.js';
import ExcelJS from 'exceljs';

// Get revenue statistics
export const getRevenue = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'startDate and endDate are required' });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        // Get orders in date range
        const orders = await Order.find({
            createdAt: { $gte: start, $lte: end }
        }).populate('items.foodId', 'name nameEN price');

        // Calculate statistics
        const totalOrders = orders.length;
        const completedOrders = orders.filter(o =>
            ['COMPLETED', 'PAID', 'DELIVERED'].includes(o.orderState)
        );
        const totalRevenue = completedOrders.reduce((sum, o) => sum + o.finalAmount, 0);
        const totalDiscount = completedOrders.reduce((sum, o) => sum + o.discountAmount, 0);

        // Order count by status
        const ordersByStatus = {};
        orders.forEach(order => {
            ordersByStatus[order.orderState] = (ordersByStatus[order.orderState] || 0) + 1;
        });

        // Top selling foods
        const foodSales = {};
        completedOrders.forEach(order => {
            order.items.forEach(item => {
                const foodId = item.foodId?._id?.toString() || item.foodId?.toString();
                const foodName = item.foodId?.name || 'Unknown';
                if (!foodSales[foodId]) {
                    foodSales[foodId] = {
                        name: foodName,
                        quantity: 0,
                        revenue: 0
                    };
                }
                foodSales[foodId].quantity += item.quantity;
                foodSales[foodId].revenue += item.price * item.quantity;
            });
        });

        const topFoods = Object.values(foodSales)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 10);

        // Daily revenue breakdown
        const dailyRevenue = {};
        completedOrders.forEach(order => {
            const dateKey = order.createdAt.toISOString().split('T')[0];
            if (!dailyRevenue[dateKey]) {
                dailyRevenue[dateKey] = { date: dateKey, orders: 0, revenue: 0 };
            }
            dailyRevenue[dateKey].orders += 1;
            dailyRevenue[dateKey].revenue += order.finalAmount;
        });

        const dailyBreakdown = Object.values(dailyRevenue).sort((a, b) =>
            new Date(a.date) - new Date(b.date)
        );

        res.json({
            startDate,
            endDate,
            summary: {
                totalOrders,
                completedOrders: completedOrders.length,
                totalRevenue,
                totalDiscount,
                averageOrderValue: completedOrders.length > 0
                    ? Math.round(totalRevenue / completedOrders.length)
                    : 0
            },
            ordersByStatus,
            topFoods,
            dailyBreakdown
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Export revenue report as Excel
export const getRevenueExport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'startDate and endDate are required' });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        // Get completed orders in date range
        const orders = await Order.find({
            createdAt: { $gte: start, $lte: end },
            orderState: { $in: ['COMPLETED', 'PAID', 'DELIVERED'] }
        })
            .populate('items.foodId', 'name nameEN price')
            .populate('userId', 'fullName email phoneNumber')
            .sort({ createdAt: -1 });

        // Create workbook
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'SpicyHunt';
        workbook.created = new Date();

        // Summary sheet
        const summarySheet = workbook.addWorksheet('Summary');
        const totalRevenue = orders.reduce((sum, o) => sum + o.finalAmount, 0);
        const totalDiscount = orders.reduce((sum, o) => sum + o.discountAmount, 0);

        summarySheet.columns = [
            { header: 'Metric', key: 'metric', width: 25 },
            { header: 'Value', key: 'value', width: 20 }
        ];
        summarySheet.addRows([
            { metric: 'Report Period', value: `${startDate} - ${endDate}` },
            { metric: 'Total Orders', value: orders.length },
            { metric: 'Total Revenue', value: totalRevenue },
            { metric: 'Total Discount', value: totalDiscount },
            { metric: 'Average Order Value', value: orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0 }
        ]);

        // Style header
        summarySheet.getRow(1).font = { bold: true };
        summarySheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        // Orders sheet
        const ordersSheet = workbook.addWorksheet('Orders');
        ordersSheet.columns = [
            { header: 'Order ID', key: 'orderId', width: 25 },
            { header: 'Date', key: 'date', width: 20 },
            { header: 'Customer', key: 'customer', width: 25 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Payment', key: 'payment', width: 12 },
            { header: 'Total', key: 'total', width: 15 },
            { header: 'Discount', key: 'discount', width: 12 },
            { header: 'Final', key: 'final', width: 15 },
            { header: 'Items', key: 'items', width: 40 }
        ];

        orders.forEach(order => {
            const itemsStr = order.items.map(item =>
                `${item.foodId?.name || 'Unknown'} x${item.quantity}`
            ).join(', ');

            ordersSheet.addRow({
                orderId: order._id.toString(),
                date: order.createdAt.toISOString().split('T')[0],
                customer: order.userId?.fullName || order.userId?.email || 'N/A',
                status: order.orderState,
                payment: order.paymentMethod,
                total: order.totalAmount,
                discount: order.discountAmount,
                final: order.finalAmount,
                items: itemsStr
            });
        });

        // Style header
        ordersSheet.getRow(1).font = { bold: true };
        ordersSheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        // Top Products sheet
        const productsSheet = workbook.addWorksheet('Top Products');

        // Calculate product sales
        const foodSales = {};
        orders.forEach(order => {
            order.items.forEach(item => {
                const foodId = item.foodId?._id?.toString() || item.foodId?.toString();
                const foodName = item.foodId?.name || 'Unknown';
                if (!foodSales[foodId]) {
                    foodSales[foodId] = { name: foodName, quantity: 0, revenue: 0 };
                }
                foodSales[foodId].quantity += item.quantity;
                foodSales[foodId].revenue += item.price * item.quantity;
            });
        });

        const topProducts = Object.values(foodSales)
            .sort((a, b) => b.quantity - a.quantity);

        productsSheet.columns = [
            { header: 'Product Name', key: 'name', width: 30 },
            { header: 'Quantity Sold', key: 'quantity', width: 15 },
            { header: 'Revenue', key: 'revenue', width: 15 }
        ];

        topProducts.forEach(product => {
            productsSheet.addRow(product);
        });

        productsSheet.getRow(1).font = { bold: true };
        productsSheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        // Generate buffer
        const buffer = await workbook.xlsx.writeBuffer();

        // Set response headers
        const filename = `revenue_report_${startDate}_${endDate}.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', buffer.length);

        res.send(buffer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
