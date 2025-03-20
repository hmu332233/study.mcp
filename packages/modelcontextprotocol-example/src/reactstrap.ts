import express from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';

import { z } from 'zod';

// 모의 reactstrap 문서 데이터
const reactstrapDocs = {
  Button: `
# Button
The Button component provides styled buttons with Bootstrap classes.

## Props
- **color**: string (e.g., "primary", "secondary")
- **size**: string (e.g., "lg", "sm")
- **onClick**: function

## Example
\`\`\`jsx
<Button color "primary" onClick={() => alert('Clicked!')}>Click Me</Button>
\`\`\`
  `,
  Modal: `
# Modal
The Modal component creates a dialog box/popup window.

## Props
- **isOpen**: boolean
- **toggle**: function

## Example
\`\`\`jsx
<Modal isOpen={isOpen} toggle={() => setIsOpen(!isOpen)}>
  <ModalHeader>Modal Title</ModalHeader>
  <ModalBody>Hello!</ModalBody>
</Modal>
\`\`\`
  `,
};

// MCP 서버 설정
const server = new McpServer({
  name: 'Reactstrap Docs Server',
  version: '1.0.0',
});

// 리소스: 전체 문서 제공
server.resource(
  'docs',
  new ResourceTemplate('reactstrap://docs', { list: undefined }),
  async (uri) => ({
    contents: [
      {
        uri: uri.href,
        text: Object.values(reactstrapDocs).join('\n\n'),
      },
    ],
  }),
);

// 리소스: 특정 컴포넌트 문서 제공
server.resource(
  'component',
  new ResourceTemplate('reactstrap://component/{name}', { list: undefined }),
  async (uri, { name }) => {
    const doc = reactstrapDocs[name as keyof typeof reactstrapDocs];
    if (!doc) {
      return {
        contents: [{ uri: uri.href, text: `Component "${name}" not found.` }],
      };
    }
    return { contents: [{ uri: uri.href, text: doc }] };
  },
);

// 도구: 컴포넌트 정보 검색
server.tool(
  'getComponentInfo',
  { componentName: z.string() },
  async ({ componentName }) => {
    const doc = reactstrapDocs[componentName as keyof typeof reactstrapDocs];
    if (!doc) {
      return {
        content: [
          { type: 'text', text: `Component "${componentName}" not found.` },
        ],
        isError: true,
      };
    }
    const summary = `Found ${componentName}: ${doc.split('\n')[0]}`;
    return { content: [{ type: 'text', text: summary }] };
  },
);

// Express 서버 설정
const app = express();
app.use(express.json()); // POST 요청의 JSON 파싱을 위해

const sessions = new Map<string, SSEServerTransport>();

// SSE 엔드포인트
app.get('/sse', async (req, res) => {
  // const transport = new SSEServerTransport("/messages", res);
  // await server.connect(transport);
  // console.log("SSE connection established");

  const transport = new SSEServerTransport('/messages', res);
  sessions.set(transport.sessionId, transport);
  await server.connect(transport);
});

// 메시지 처리 엔드포인트
app.post('/messages', async (req, res) => {
  console.log(req.query.sessionId);
  const sessionId = req.query.sessionId as string;
  const transport = sessions.get(sessionId)!;
  if (!transport) {
    throw new Error(`Session ${sessionId} not found`);
  }
  await transport.handlePostMessage(req, res);
});

// 서버 시작
const PORT = 3001;
// app.listen(PORT, () => {
//   console.log(`Reactstrap MCP Server is running on http://localhost:${PORT}`);
// });

const transport = new StdioServerTransport();
await server.connect(transport);
