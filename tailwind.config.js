/** @type {import('tailwindcss').Config} */
/* Tailwind 基础配置，扫描 index.html 与 src 目录下的所有前端资源文件 */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      /* 在这里扩展自定义主题，如 colors / spacing / fontFamily 等 */
    }
  },
  plugins: []
}