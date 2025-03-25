"use client";

import React, { forwardRef } from "react";
import ReactQuill from "react-quill-new";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ReactQuillWrapper = forwardRef<any, any>((props, ref) => {
  return <ReactQuill {...props} ref={ref} />;
});

ReactQuillWrapper.displayName = "ReactQuillWrapper";

export default ReactQuillWrapper;
