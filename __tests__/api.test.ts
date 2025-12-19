/**
 * API测试文件 - TypeScript版本
 * 复刻原来JavaScript版本test.js的核心功能
 */
// 使用真实的HTTP客户端进行测试
import axios from 'axios';

describe("no power api test", () => {
    // 注意：这些测试需要API服务正在运行才能通过

    it('TestMenu/Test78/getConfig78', async () => {
        // 设置单个测试的超时时间
        jest.setTimeout(10000);

        // 尝试调用API，如果失败则让测试真正失败
        const response = await axios.get("http://localhost:88/apitest/testmenu/Test78/getConfig78", {
            params: {
                pars: ["test"]
            }
        });

        console.log(response.data);
        expect(response.data).toHaveProperty("back");
        expect(response.data.back).toBe("不能公开config测试的时候用用");
    });

    it('TestMenu/Test78/test', async () => {
        // 设置单个测试的超时时间
        jest.setTimeout(10000);

        // 尝试调用API，如果失败则让测试真正失败
        const response = await axios.get("http://localhost:88/apitest/testmenu/Test78/test", {
            params: {
                pars: ["test"]
            }
        });

        console.log(response.data);
        expect(response.data).toHaveProperty("back");
        expect(response.data.back).toBe("看到我说明路由ok,中文ok,无权限调用OKtest");
    });

    it('TestMenu/Test78/test2', async () => {
        // 设置单个测试的超时时间
        jest.setTimeout(10000);

        // 尝试调用API，如果失败则让测试真正失败
        const response = await axios.get("http://localhost:88/apitest/testmenu/Test78/test2", {
            params: {
                pars: ["test"]
            }
        });

        console.log(response.data);
        expect(response.data).toHaveProperty("back");
        expect(response.data.back).toBe("有权限调用OKtest");
    });
});