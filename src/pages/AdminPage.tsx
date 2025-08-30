import React from 'react';

/**
 * 管理端页面占位
 * 后续计划：
 * - 展示 / 编辑 当前投票配置 (PollConfig)
 * - 支持新增 / 删除题目选项
 * - 展示实时或刷新式统计 (VoteResults)
 * - 控制投票开关、最大可选数量等
 */
const AdminPage: React.FC = () => {
  return (
    <main className="container-responsive py-10 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">管理后台（占位）</h1>
        <p className="text-sm text-gray-600">
          这里将提供配置投票、查看投票统计的功能界面。
        </p>
      </header>

      <section className="rounded-lg border bg-white p-6 shadow-sm space-y-3">
        <p className="text-gray-500">
          功能未实现。后续将接入 Edge Config / API Route 获取与存储数据。
        </p>
        <ul className="list-disc pl-5 text-sm text-gray-500 space-y-1">
          <li>创建 / 更新 PollConfig</li>
          <li>题目选项增删排序</li>
          <li>投票开关控制（开启/关闭）</li>
          <li>查看实时统计（票数 / 百分比）</li>
        </ul>
      </section>
    </main>
  );
};

export default AdminPage;