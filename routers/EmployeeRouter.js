const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Employee = require('../models/Employee');
const isAuthenticated = require('../middlewares/authMiddleware');

// Helper function for handling errors
const handleError = (res, error, message = 'Đã xảy ra lỗi', statusCode = 500) => {
    console.error(error);
    res.status(statusCode).send(message);
};

// Route: Lấy danh sách nhân viên
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const employees = await Employee.find();
        res.render('layout', { content: 'pages/employees', employees });
    } catch (error) {
        handleError(res, error, 'Lỗi khi lấy danh sách nhân viên');
    }
});

// Route: Thêm nhân viên mới
router.post('/add', isAuthenticated, async (req, res) => {
    try {
        const {
            name, email, password = "123456", phone, address, salary, role
        } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);
        const newEmployee = new Employee({
            name,
            email,
            password: hashedPassword,
            phone,
            address,
            startDate: new Date(),
            salary,
            role
        });

        await newEmployee.save();
        res.redirect('/employees');
    } catch (error) {
        handleError(res, error, 'Lỗi khi thêm nhân viên');
    }
});

// Route: Xóa nhân viên
router.get('/delete/:id', isAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        const employee = await Employee.findById(id);

        if (!employee) return res.status(404).send('Nhân viên không tồn tại');

        await Employee.findByIdAndDelete(id);
        res.redirect('/employees');
    } catch (error) {
        handleError(res, error, 'Lỗi khi xóa nhân viên');
    }
});

// Route: Hiển thị form sửa nhân viên
router.get('/update/:id', isAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        const employee = await Employee.findById(id);

        if (!employee) return res.status(404).send('Nhân viên không tồn tại');

        res.render('layout', { content: 'pages/employee-update', employee });
    } catch (error) {
        handleError(res, error, 'Lỗi khi tìm nhân viên');
    }
});

// Route: Cập nhật thông tin nhân viên
router.post('/update/:id', isAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, address, position, shift, salary, role } = req.body;

        const updatedEmployee = await Employee.findByIdAndUpdate(
            id,
            { name, email, phone, address, position, shift, salary, role },
            { new: true }
        );

        if (!updatedEmployee) return res.status(404).send('Nhân viên không tồn tại');

        res.redirect('/employees');
    } catch (error) {
        handleError(res, error, 'Lỗi khi cập nhật thông tin');
    }
});

// Route: Xem thông tin chi tiết nhân viên
router.get('/detail/:id', isAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        const employee = await Employee.findById(id);

        if (!employee) return res.status(404).send('Nhân viên không tồn tại');

        res.render('layout', { content: 'pages/employee-detail', employee });
    } catch (error) {
        handleError(res, error, 'Lỗi khi tìm nhân viên');
    }
});
// Route: Tìm kiếm nhân viên
router.get('/search', isAuthenticated, async (req, res) => {
    const searchQuery = req.query.q;
    try {
        employee = searchQuery
            ? await Employee.find({
                $or: [
                    { name: { $regex: searchQuery, $options: 'i' } }, // Tìm kiếm tên sản phẩm
                    { phone: { $regex: searchQuery, $options: 'i' } }, // Tìm kiếm mã sản phẩm
                    { email: { $regex: searchQuery, $options: 'i' } }
                ]
            }) : await Employee.find();
        res.json(employee);
    } catch (error) { 
        console.log(error);
    }
});



// Route: Thay đổi mật khẩu
router.post('/change-password/:employeeId' ,isAuthenticated, async (req, res) => {
    try {
        const { employeeId } = req.params; // Lấy employeeId từ URL params
        const { currentPassword, newPassword } = req.body; // Nhận dữ liệu từ body request

        // Kiểm tra mật khẩu hiện tại
        const isPasswordMatch = await bcrypt.compare(currentPassword, employee.password);
        if (!isPasswordMatch) {
            return res.status(400).send('Mật khẩu hiện tại không đúng');
        }
        // Hash mật khẩu mới và cập nhật
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        employee.password = hashedPassword;
        await employee.save();

        res.redirect(`/employees/detail/${employeeId}`);
    } catch (err) {
        handleError(res, err, 'Lỗi khi thay đổi mật khẩu');
    }
});

module.exports = router;
