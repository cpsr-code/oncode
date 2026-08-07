import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router";
import { Maximize2, Minimize2, Play, Send } from "lucide-react";
import axiosClient from "../../utils/axiosClient";

import GlobalNavbar from "../../components/GlobalNavbar";

// LEFT-PANE TABS
import ProblemDescription from "../../components/ProblemDescription";
import ProblemSolution from "../../components/ProblemSolution";
import ChatAI from "../../components/ProblemChatAI";
import ProblemSubmissions from "../../components/ProblemSubmissions";

// RIGHT-PANE TABS
import ProblemCodeEditor from "../../components/ProblemCodeEditor";
import ProblemTestcase from "../../components/ProblemTestcase";
import ProblemResult from "../../components/ProblemResult";

const ProblemWorkSpace = () => {
  let { problemId } = useParams();

  // --- Core State ---
  const [problem, setProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("cpp");
  const [code, setCode] = useState("// Write your code here...");
  
  // Changed loading to a string to track which button is spinning ('run' | 'submit' | null)
  const [loadingAction, setLoadingAction] = useState(null);
  
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);

  // --- Editor Settings State ---
  const [fontSize, setFontSize] = useState(16);

  // --- Tab State ---
  const [activeLeftTab, setActiveLeftTab] = useState("Description");
  const [activeRightTab, setActiveRightTab] = useState("Code");

  // --- Fullscreen State ---
  const [isLeftFullScreen, setIsLeftFullScreen] = useState(false);
  const [isRightFullScreen, setIsRightFullScreen] = useState(false);

  const editorRef = useRef(null);

  const leftTabs = ["Description", "Solution", "Submissions", "ChatAI"];
  const rightTabs = ["Code", "Testcase", "Result"];
  const languages = ["cpp", "java"];
  const fontSizes = [12, 14, 16, 18, 20, 24]; 

  const [userCodes, setUserCodes] = useState({});

  // Fetch the problem
  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const { data } = await axiosClient.get(`/problem/${problemId}`);
        setProblem(data.problem);
        if (data.problem && data.problem.codeSnippets) {
          const initialCodes = {};
          data.problem.codeSnippets.forEach(snippet => {
            initialCodes[snippet.language] = snippet.userSnippet;
          });
          setUserCodes(initialCodes);
          setCode(initialCodes["cpp"] || "// Write your code here...");
          setSelectedLanguage("cpp");
        }
      } catch (err) {
        console.error("Failed to fetch problem", err);
      }
    };
    fetchProblem();
  }, [problemId]);

  const handleLanguageChange = (lang) => {
    setUserCodes(prev => ({ ...prev, [selectedLanguage]: code }));
    setSelectedLanguage(lang);
    setCode(userCodes[lang] || "// Write your code here...");
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
  };

  // --- Execution Handlers ---

  const handleRun = async () => {
    if (!code || code.trim() === "") return;
    
    setLoadingAction("run");
    setRunResult(null); 
    setSubmitResult(null); 
    
    try {
      const payload = {
        code: code,
        language: selectedLanguage,
      };

      const { data } = await axiosClient.post(`/submission/run/${problemId}`, payload);
      
      setRunResult(data);
      setActiveRightTab("Result"); 
    } catch (error) {
      console.error("Failed to execute code:", error);
      setRunResult({
        status: "System Error",
        errorMessage: error.response?.data?.message || "Failed to connect to the execution server.",
        input: "",
        expectedOutput: "",
        actualOutput: "",
        runtime: 0,
        memory: 0
      });
      setActiveRightTab("Result");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSubmit = async () => {
    if (!code || code.trim() === "") return;
    
    setLoadingAction("submit");
    setSubmitResult(null); 
    setRunResult(null); 
    
    try {
      const payload = {
        code: code,
        language: selectedLanguage,
      };

      const { data } = await axiosClient.post(`/submission/submit/${problemId}`, payload);
      
      
      setSubmitResult(data.submissionResult);
      setActiveRightTab("Result"); 
      
    } catch (error) {
      console.error("Failed to submit code:", error);
      setSubmitResult({
        status: "System Error",
        errorMessage: error.response?.data?.message || "Failed to connect to the evaluation server.",
        testCasesPassed: 0,
        testCasesTotal: 0,
        runtime: 0,
        memory: 0
      });
      setActiveRightTab("Result");
    } finally {
      setLoadingAction(null);
    }
  };

  // Prevent rendering until we have basic problem data
  if (!problem) {
    return (
      <div className="flex h-screen items-center justify-center bg-base-300">
        <span className="loading loading-spinner text-primary loading-lg"></span>
      </div>
    );
  }

  return (
    <>
      <GlobalNavbar></GlobalNavbar>
      <div className="flex h-[calc(100vh-64px)] w-full bg-base-300 text-base-content overflow-hidden">
        
        {/* ================= LEFT PANE (Problem Details) ================= */}
        {!isRightFullScreen && (
          <div
            className={`flex flex-col border-r border-base-content/10 bg-base-300 transition-all duration-300 ${isLeftFullScreen ? "w-full" : "w-[40%]"}`}
          >
            {/* Left Header Tabs */}
            <div className="flex items-center justify-between bg-base-200 border-b border-base-content/10 px-2 h-12 shrink-0">
              <div className="flex space-x-1 overflow-x-auto no-scrollbar">
                {leftTabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveLeftTab(tab)}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      activeLeftTab === tab
                        ? "bg-base-300 text-base-content shadow-sm"
                        : "text-base-content/60 hover:text-base-content hover:bg-base-300/50"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Fullscreen Toggle */}
              <button
                onClick={() => setIsLeftFullScreen(!isLeftFullScreen)}
                className="p-2 text-base-content/60 hover:text-base-content hover:bg-base-300 rounded-md ml-2"
                title={isLeftFullScreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                {isLeftFullScreen ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Left Content Area */}
            <div className="flex-1 overflow-y-auto p-6 relative">
              {activeLeftTab === "Description" && (
                <ProblemDescription problem={problem} />
              )}
              {activeLeftTab === "Solution" && (
                <ProblemSolution problem={problem} />
              )}
              {activeLeftTab === "ChatAI" && (
                <div className="absolute inset-0">
                  <ChatAI
                    problem={problem}
                    code={code}
                    language={selectedLanguage}
                  />
                </div>
              )}
              {activeLeftTab === "Submissions" && (
                <ProblemSubmissions problemId={problemId} />
              )}
            </div>
          </div>
        )}

        {/* ================= RIGHT PANE (Code Editor & Execution) ================= */}
        {!isLeftFullScreen && (
          <div
            className={`flex flex-col bg-base-300 transition-all duration-300 ${isRightFullScreen ? "w-full" : "w-[60%]"}`}
          >
            {/* Right Header Tabs */}
            <div className="flex items-center justify-between bg-base-200 border-b border-base-content/10 px-2 h-12 shrink-0">
              <div className="flex space-x-1">
                {rightTabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveRightTab(tab)}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      activeRightTab === tab
                        ? "bg-base-300 text-base-content shadow-sm"
                        : "text-base-content/60 hover:text-base-content hover:bg-base-300/50"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Fullscreen Toggle */}
              <button
                onClick={() => setIsRightFullScreen(!isRightFullScreen)}
                className="p-2 text-base-content/60 hover:text-base-content hover:bg-base-300 rounded-md"
                title={isRightFullScreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                {isRightFullScreen ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Right Content Area (Dynamic Tabs) */}
            <div className="flex-1 flex flex-col min-h-0">
              
              {activeRightTab === "Code" && (
                <ProblemCodeEditor
                  code={code}
                  setCode={setCode}
                  selectedLanguage={selectedLanguage}
                  setSelectedLanguage={handleLanguageChange}
                  fontSize={fontSize}
                  setFontSize={setFontSize}
                  languages={languages}
                  fontSizes={fontSizes}
                  handleEditorDidMount={handleEditorDidMount}
                />
              )}

              {activeRightTab === "Testcase" && (
                <ProblemTestcase problem={problem} />
              )}

              {activeRightTab === "Result" && (
                <ProblemResult 
                  runResult={runResult} 
                  submitResult={submitResult} 
                  loading={loadingAction !== null} 
                />
              )}

            </div>

            {/* Bottom Execution Toolbar (Always Visible) */}
            <div className="flex items-center justify-end px-4 h-14 bg-base-200 border-t border-base-content/10 gap-3 shrink-0">
              <button
                onClick={handleRun}
                disabled={loadingAction !== null}
                className="btn btn-sm btn-neutral font-medium px-6"
              >
                {loadingAction === "run" ? (
                  <span className="loading loading-spinner loading-xs mr-1"></span>
                ) : (
                  <Play className="w-4 h-4 mr-1" />
                )}
                Run
              </button>
              <button
                onClick={handleSubmit}
                disabled={loadingAction !== null}
                className="btn btn-sm btn-success text-success-content font-medium px-6"
              >
                {loadingAction === "submit" ? (
                  <span className="loading loading-spinner loading-xs mr-1"></span>
                ) : (
                  <Send className="w-4 h-4 mr-1" />
                )}
                Submit
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProblemWorkSpace;