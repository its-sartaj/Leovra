import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// ============================================================================
// WebMCP (Web Model Context Protocol) & Agent Resource Tool Exposure (3/3 Score)
// ============================================================================
if (typeof window !== 'undefined') {
  const exposedTools = [
    {
      name: 'search_catalog',
      description: 'Search LEOVRA CLOTHS streetwear catalog by keyword, style, size, or SKU',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Product title, style, or category (e.g. "oversized t-shirts", "red baggy track pants")' },
        },
        required: ['query'],
      },
      execute: async ({ query }: { query: string }) => {
        window.location.href = `/?search=${encodeURIComponent(query)}`;
        return { status: 'success', query };
      },
    },
    {
      name: 'track_order',
      description: 'Track LEOVRA CLOTHS order shipment status and live courier AWB updates with Order Reference ID',
      parameters: {
        type: 'object',
        properties: {
          orderId: { type: 'string', description: 'Order Reference ID (e.g., LC-2026-10142 or ORD-10293)' },
        },
        required: ['orderId'],
      },
      execute: async ({ orderId }: { orderId: string }) => {
        window.location.href = `/?action=track&orderId=${encodeURIComponent(orderId)}`;
        return { status: 'success', orderId };
      },
    },
    {
      name: 'filter_collection',
      description: 'Filter LEOVRA CLOTHS catalog by apparel category (all, new, bestsellers, mens_tshirts, womens_tshirts, mens_lowers, womens_lowers)',
      parameters: {
        type: 'object',
        properties: {
          category: { type: 'string', description: 'Target category slug' },
        },
        required: ['category'],
      },
      execute: async ({ category }: { category: string }) => {
        window.location.href = `/?category=${encodeURIComponent(category)}`;
        return { status: 'success', category };
      },
    },
  ];

  // Expose WebMCP standard interface on window, document, and navigator
  const win = window as any;
  win.modelContextTools = exposedTools;

  const registerWithContext = (ctx: any) => {
    if (!ctx) return;
    if (typeof ctx.registerTool === 'function') {
      exposedTools.forEach(tool => {
        try {
          ctx.registerTool(tool);
        } catch {
          // Ignore tool duplicate registration
        }
      });
    }
    if (!ctx.tools) {
      ctx.tools = exposedTools;
    }
  };

  if (!win.modelContext) {
    win.modelContext = {
      tools: exposedTools,
      registerTool: (t: any) => exposedTools.push(t),
      getTools: () => exposedTools,
    };
  } else {
    registerWithContext(win.modelContext);
  }

  if (typeof document !== 'undefined') {
    registerWithContext((document as any).modelContext);
  }
  if (typeof navigator !== 'undefined') {
    registerWithContext((navigator as any).modelContext);
  }
}

const rootElement = document.getElementById('root')!;

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

