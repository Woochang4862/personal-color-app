import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import loading_cube from "../assets/loading_cube.gif";
import colorAnalysisService from "../services/colorAnalysisService";
import { sendOSCToTouchDesigner } from "../sendOSCToTouchDesigner";

const LoadingPage = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState("이미지를 불러오는 중...");
  useEffect(() => {
    const selectedSeason = sessionStorage.getItem("selectedSeason");
    if (selectedSeason) {
      setStatus("계절의 추억을 불러오는 중...");
      setTimeout(async () => {
        console.log("🚀 Sending OSC data to TouchDesigner...");
        const oscResult = await sendOSCToTouchDesigner(
          {
            apiResponse: {
              colorResult: {
                season: selectedSeason,
              },
            },
          },
          `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`,
          Math.floor(Math.random() * 4)
        );
        console.log(oscResult);
        navigate("/");
      }, 2000);
      return;
    }
    // 기존 분석 로직 (이미지 기반)
    const performAnalysis = async () => {
      try {
        // 세션 스토리지에서 이미지와 정보 가져오기
        const capturedImage = sessionStorage.getItem("capturedImage");
        const imageSource = sessionStorage.getItem("imageSource");
        const selectedSeason = sessionStorage.getItem("selectedSeason");
        const selectedImageData = sessionStorage.getItem("selectedImageData");
        const outfitDescription = sessionStorage.getItem("outfitDescription");

        if (!capturedImage) {
          setStatus("이미지를 찾을 수 없습니다...");
          setTimeout(() => navigate("/capture"), 2000);
          return;
        }

        setStatus("퍼스널 컬러를 분석하는 중...");

        // 실제 분석 수행
        const result = await colorAnalysisService.analyzeImageDirect(
          capturedImage,
          outfitDescription
        );
        console.log(result);
        if (result.success) {
          setStatus("분석이 완료되었습니다!");

          // 분석 결과와 관련 정보를 세션 스토리지에 저장
          sessionStorage.setItem("analysisResult", JSON.stringify(result.data));
          sessionStorage.setItem("analyzedImage", capturedImage);

          // 추가 정보도 함께 저장 (MemoryPage에서 온 경우)
          if (selectedSeason) {
            sessionStorage.setItem(
              "memoryPageData",
              JSON.stringify({
                selectedSeason,
                selectedImageData: selectedImageData
                  ? JSON.parse(selectedImageData)
                  : null,
                outfitDescription,
              })
            );
          }

          // 잠시 후 결과 페이지로 이동
          setTimeout(() => {
            navigate("/result");
          }, 1000);
        } else {
          setStatus("분석에 실패했습니다...");
          setTimeout(() => navigate("/capture"), 2000);
        }
      } catch (error) {
        console.error("분석 중 오류 발생:", error);
        setStatus("분석 중 오류가 발생했습니다...");
        setTimeout(() => navigate("/capture"), 2000);
      }
    };

    performAnalysis();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center justify-center text-center">
        <img src={loading_cube} alt="로딩 중" className="w-40 h-40 mb-8" />
        <p className="text-gray-300 text-lg">
          {status}
          <br />
          잠시 기다려주세요.
        </p>
      </div>
    </div>
  );
};

export default LoadingPage;
