import { FastMCP } from 'fastmcp';
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
const server = new FastMCP({
  name: 'My Server',
  version: '1.0.0',
});
