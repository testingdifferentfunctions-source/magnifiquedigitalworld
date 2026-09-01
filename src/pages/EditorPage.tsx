import React from "react";
import { Navigate } from "react-router-dom";

const EditorPage: React.FC = () => {
  return <Navigate to="/tools/code-editor" replace />;
};

export default EditorPage;

