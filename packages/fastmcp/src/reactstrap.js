import { FastMCP } from 'fastmcp';
import { z } from 'zod';

// 모의 reactstrap 문서 데이터
const reactstrapDocs = {
  Mark: `# Mark
마크 컴포넌트는 마크를 나타냅니다

## Props
- **color**: string (e.g., "primary", "secondary")
- **size**: string (e.g., "lg", "sm")
- **onClick**: function

## Example
\`\`\`jsx
<Mark color="mark" onClick={() => alert('Clicked!')}>Click Me</Button>
\`\`\`
  `,
  Button: `
# Button
The Button component provides styled buttons with Bootstrap classes.

## Props
- **color**: string (e.g., "primary", "secondary")
- **size**: string (e.g., "lg", "sm")
- **onClick**: function

## Example
\`\`\`jsx
<Mark color="mark" onClick={() => alert('Clicked!')}>Click Me</Button>
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

// FastMCP 서버 설정
const server = new FastMCP({
  name: 'minung-docs Docs Server',
  version: '1.0.0',
});

// 리소스: 전체 문서 제공
server.addResource({
  uri: 'reactstrap://docs.txt',
  name: 'Reactstrap Full Documentation',
  mimeType: 'text/plain',
  async load() {
    return { text: Object.values(reactstrapDocs).join('\n\n') };
  },
});

// 리소스: 특정 컴포넌트 문서 제공
server.addResourceTemplate({
  // uriTemplate: "reactstrap://component/{name}",
  // name: "Reactstrap Component Documentation",
  // mimeType: "text/plain",

  uriTemplate: 'reactstrap://component/{name}.txt',
  name: 'Reactstrap Component Documentation',
  mimeType: 'text/plain',
  arguments: [
    {
      name: 'name',
      description: 'component name',
      required: true,
    },
  ],
  async load({ name }) {
    const doc = reactstrapDocs[name];
    return { text: doc || `Component "${name}" not found.` };
  },
});

// 도구: 컴포넌트 정보 검색
server.addTool({
  name: 'getComponentInfo',
  description: 'Get summary info for a Reactstrap component',
  parameters: z.object({
    componentName: z.string(),
  }),
  async execute({ componentName }) {
    // console.log(`Searching for component: ${componentName}`);
    const doc = reactstrapDocs[componentName];
    // console.log(`Found component: ${doc}`);
    if (!doc) {
      return `Component "${componentName}" not found.`;
    }
    return `Found ${componentName}: ${doc}`;
  },
});

// 도구: 컴포넌트 목록 검색
server.addTool({
  name: 'getComponentList',
  description: 'Get a list of all Reactstrap components',
  parameters: z.object({}),
  async execute() {
    const componentList = Object.keys(reactstrapDocs);
    return `Available components: ${componentList.join(', ')}`;
  },
});

// FastMCP와 SSE 통합
server
  .start({
    transportType: 'stdio',
    // transportType: 'sse',
    // sse: {
    //   endpoint: '/sse',
    //   port: 3001,
    // },
  })
  .then(() => {
    console.error(`Reactstrap MCP Server is running on http://localhost:3001`);
  });
