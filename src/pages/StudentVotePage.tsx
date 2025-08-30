import React from 'react';

/**
 * 学生端投票页面占位
 * 后续将：
 * - 拉取当前投票配置（PollConfig）
 * - 展示题目 / 选项列表
 * - 使用 react-hook-form 收集选择
 * - 提交到 Edge Config / API Route
 */
const StudentVotePage: React.FC = () => {
  return (
    <main className="container-responsive py-10 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">试卷讲解优先级投票</h1>
        <p className="text-sm text-gray-600">
          占位页面：这里将展示可投票的题目或知识点列表。
        </p>
      </header>

      <section className="rounded-lg border bg-white p-6 shadow-sm">
        <p className="text-gray-500">投票功能尚未实现，后续补充表单与交互。</p>
      </section>
    </main>
  );
};

export default StudentVotePage;