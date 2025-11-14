import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

// ✅ Load environment theo mode (vite --mode ...)
export default defineConfig(({ mode }) => {
  // Load biến môi trường cho mode hiện tại
  const env = loadEnv(mode, process.cwd(), "");

  // ✅ Xác định target (customer / admin / restaurant)
  const target = (env.VITE_TARGET || process.env.VITE_TARGET || "customer").toUpperCase();

  // ✅ Lấy port (ưu tiên theo target, sau đó tới VITE_PORT, cuối cùng mặc định 5173)
  const port =
    Number(env[`VITE_PORT_${target}`]) ||
    Number(env.VITE_PORT) ||
    5173;

  // ✅ Base path cho deploy (VD: /admin/ khi host nhiều app)
  const base = env.VITE_BASE || "/";

  return {
    plugins: [react()],
    base,
    server: {
      port,
      host: true,
    },
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./pages", import.meta.url)),
      },
    },
    // ✅ Chỉ expose biến cần thiết ra client
    define: {
      __APP_TARGET__: JSON.stringify(env.VITE_TARGET || process.env.VITE_TARGET),
      __APP_ENV__: JSON.stringify(env.NODE_ENV || process.env.NODE_ENV),
    },
  };
});
