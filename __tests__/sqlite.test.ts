// /**
// linux下不能正常
//  * SQLite数据库测试文件
//  * 用于测试SQLite数据库连接、表创建和基本操作
//  */
// // 使用真实的HTTP客户端进行测试
// import axios from 'axios';

// describe("SQLite Database Tests", () => {
//     // 注意：这些测试需要API服务正在运行才能通过

//     const baseURL = "http://localhost:88/apitest/testmenu";

// it('should initialize SQLite database connection', async () => {
//     // 设置单个测试的超时时间
//     jest.setTimeout(15000);

//     try {
//         // 初始化数据库
//         const response = await axios.get(`${baseURL}/SqliteTest/initDb`);

//         console.log('Database initialization response:', response.data);
//         expect(response.status).toBe(200);
//         expect(response.data).toHaveProperty('back');
//     } catch (error) {
//         console.error('Database initialization error:', error.response?.data || error.message);
//         throw error;
//     }
// });

// it('should create system tables including sys_log', async () => {
//     // 设置单个测试的超时时间
//     jest.setTimeout(15000);

//     try {
//         // 创建表
//         const response = await axios.get(`${baseURL}/SqliteTest/createTables`);

//         console.log('Create tables response:', response.data);
//         expect(response.status).toBe(200);
//         expect(response.data).toHaveProperty('back');
//         expect(response.data.back).toContain('成功'); // 成功的关键字
//     } catch (error) {
//         console.error('Create tables error:', error.response?.data || error.message);
//         throw error;
//     }
// });

// it('should insert data into sys_log table', async () => {
//     // 设置单个测试的超时时间
//     jest.setTimeout(15000);

//     try {
//         // 插入日志数据
//         const response = await axios.get(`${baseURL}/SqliteTest/insertLog`);

//         console.log('Insert log response:', response.data);
//         expect(response.status).toBe(200);
//         expect(response.data).toHaveProperty('back');
//         expect(response.data.back).toContain('成功'); // 成功的关键字
//     } catch (error) {
//         console.error('Insert log error:', error.response?.data || error.message);
//         throw error;
//     }
// });

// it('should query data from sys_log table', async () => {
//     // 设置单个测试的超时时间
//     jest.setTimeout(15000);

//     try {
//         // 查询日志数据
//         const response = await axios.get(`${baseURL}/SqliteTest/queryLogs`);

//         console.log('Query logs response:', response.data);
//         expect(response.status).toBe(200);
//         expect(response.data).toHaveProperty('back');

//         // 解析back字段中的JSON数据
//         const result = JSON.parse(response.data.back);
//         expect(result).toHaveProperty('message');
//         expect(result).toHaveProperty('count');
//         expect(result.message).toContain('成功'); // 成功的关键字

//         // 检查是否有数据返回
//         if (result.count > 0) {
//             expect(result).toHaveProperty('data');
//             expect(Array.isArray(result.data)).toBe(true);
//         }
//     } catch (error) {
//         console.error('Query logs error:', error.response?.data || error.message);
//         throw error;
//     }
// });

// it('should query data from sys_warn table', async () => {
//     // 设置单个测试的超时时间
//     jest.setTimeout(15000);

//     try {
//         // 查询警告信息
//         const response = await axios.get(`${baseURL}/SqliteTest/queryWarnings`);

//         console.log('Query warnings response:', response.data);
//         expect(response.status).toBe(200);
//         expect(response.data).toHaveProperty('back');

//         // 解析back字段中的JSON数据
//         const result = JSON.parse(response.data.back);
//         expect(result).toHaveProperty('message');
//         expect(result).toHaveProperty('count');
//         expect(result.message).toContain('成功'); // 成功的关键字
//     } catch (error) {
//         console.error('Query warnings error:', error.response?.data || error.message);
//         throw error;
//     }
// });

// it('should query data from sys_sql table', async () => {
//     // 设置单个测试的超时时间
//     jest.setTimeout(15000);

//     try {
//         // 查询SQL记录
//         const response = await axios.get(`${baseURL}/SqliteTest/querySqlRecords`);

//         console.log('Query SQL records response:', response.data);
//         expect(response.status).toBe(200);
//         expect(response.data).toHaveProperty('back');

//         // 解析back字段中的JSON数据
//         const result = JSON.parse(response.data.back);
//         expect(result).toHaveProperty('message');
//         expect(result).toHaveProperty('count');
//         expect(result.message).toContain('成功'); // 成功的关键字
//     } catch (error) {
//         console.error('Query SQL records error:', error.response?.data || error.message);
//         throw error;
//     }
// });

// 添加axios和protobufjs导入以修复找不到名称"axios"的错误
import axios from 'axios';
import * as protobuf from 'protobufjs';
import * as path from 'path';

// 添加一个测试用例来测试testProto方法
it('should test testProto method and return protobuf data', async () => {
    // 设置单个测试的超时时间
    jest.setTimeout(15000);

    try {
        // 调用testProto方法
        const response = await axios.get(`http://localhost:888/apitest/testmenu/testtb/testProto`, {
            responseType: 'arraybuffer' // 确保以ArrayBuffer的形式接收响应
        });
        
        console.log('testProto response status:', response.status);
        console.log('testProto response headers:', response.headers);
        console.log('testProto response data type:', typeof response.data);
        console.log('testProto response data length:', response.data.byteLength);
        
        // 验证响应
        expect(response.status).toBe(200);
        // 验证返回的是protobuf数据 (注意：实际返回的是application/x-protobuf)
        expect(response.headers['content-type']).toContain('application/x-protobuf');
        // 数据应该是一个Buffer或者ArrayBuffer
        expect(response.data).toBeDefined();
        
        // 尝试解析protobuf数据
        const protoPath = path.resolve(__dirname, '../src/proto/apitest/testmenu/testtb.proto');
        console.log('Proto file path:', protoPath);
        
        const root = await protobuf.load(protoPath);
        const TesttbMessage = root.lookupType('apitest_testmenu.testtb');
        
        // 解析收到的protobuf数据
        const decodedMessage: any = TesttbMessage.decode(new Uint8Array(response.data));
        console.log('Decoded protobuf message:', JSON.stringify(decodedMessage, null, 2));
        
        // 验证解析后的数据结构
        expect(decodedMessage).toHaveProperty('items');
        expect(Array.isArray(decodedMessage.items)).toBe(true);
        expect(decodedMessage.items.length).toBeGreaterThan(0);
        
        // 验证数据内容
        const firstItem = decodedMessage.items[0];
        expect(firstItem).toHaveProperty('kind');
        expect(firstItem).toHaveProperty('item');
        expect(firstItem).toHaveProperty('data');
        expect(firstItem).toHaveProperty('id');
        expect(firstItem).toHaveProperty('idpk');
        
    } catch (error) {
        console.error('testProto error:', error.response?.data || error.message);
        throw error;
    }
}, 15000);