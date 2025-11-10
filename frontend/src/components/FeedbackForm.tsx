"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Star } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { useAuth } from "@/Context/AuthContext";

interface FeedbackFormProps {
  isOpen: boolean;
  onClose: () => void;
  doctorId: string;
  doctorName: string;
}

interface FeedbackRatings {
  CommunicationRating: number;
  ProfessionalismRating: number;
  PunctualityRating: number;
  TreatmentRating: number;
  OverallRating: number;
}

const questions = [
  {
    key: "CommunicationRating" as keyof FeedbackRatings,
    question: "How well did the doctor communicate and listen to your concerns?",
    icon: "💬",
  },
  {
    key: "ProfessionalismRating" as keyof FeedbackRatings,
    question: "How professional and respectful was the doctor during your visit?",
    icon: "💬",
  },
  {
    key: "PunctualityRating" as keyof FeedbackRatings,
    question: "Was the doctor punctual and attentive to your scheduled appointment time?",
    icon: "💬",
  },
  {
    key: "TreatmentRating" as keyof FeedbackRatings,
    question: "How satisfied are you with the treatment or advice provided by the doctor?",
    icon: "💬",
  },
  {
    key: "OverallRating" as keyof FeedbackRatings,
    question: "How would you rate your overall experience with the doctor?",
    icon: "💬",
  },
];

export default function FeedbackForm({
  isOpen,
  onClose,
  doctorId,
  doctorName,
}: FeedbackFormProps) {
  const { accessToken } = useAuth();
  const [ratings, setRatings] = useState<FeedbackRatings>({
    CommunicationRating: 0,
    ProfessionalismRating: 0,
    PunctualityRating: 0,
    TreatmentRating: 0,
    OverallRating: 0,
  });
  const [hoveredRating, setHoveredRating] = useState<{
    [key: string]: number;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API = process.env.NEXT_PUBLIC_BACKEND_URL;

  const handleRatingClick = (key: keyof FeedbackRatings, rating: number) => {
    setRatings((prev) => ({ ...prev, [key]: rating }));
  };

  const handleRatingHover = (key: keyof FeedbackRatings, rating: number) => {
    setHoveredRating((prev) => ({ ...prev, [key]: rating }));
  };

  const handleRatingLeave = (key: keyof FeedbackRatings) => {
    setHoveredRating((prev) => ({ ...prev, [key]: 0 }));
  };

  const handleSubmit = async () => {
    // Validate all ratings are filled
    const allRatingsFilled = Object.values(ratings).every(
      (rating) => rating > 0
    );
    if (!allRatingsFilled) {
      toast.error("Please rate all questions before submitting");
      return;
    }

    setIsSubmitting(true);
    try {
      console.log("Submitting feedback ratings:", ratings);
      
      await axios.post(
        `${API}/usersession/givefeedback/${doctorId}`,
        ratings,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      toast.success("Feedback submitted successfully! Thank you for your input.");
      handleClose();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || 
                           error.response?.data?.Message ||
                           "Failed to submit feedback. Please try again.";
        console.error("Backend error:", error.response?.data);
        toast.error(errorMessage);
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRatings({
      CommunicationRating: 0,
      ProfessionalismRating: 0,
      PunctualityRating: 0,
      TreatmentRating: 0,
      OverallRating: 0,
    });
    setHoveredRating({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto w-[95vw] sm:w-auto">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-800">
            Rate Your Experience
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base text-gray-600">
            Please share your feedback about Dr. {doctorName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 py-3 sm:py-4">
          {questions.map((item, index) => (
            <div
              key={item.key}
              className="bg-gray-50 p-3 sm:p-5 rounded-lg border border-gray-200 hover:border-teal-300 transition-all duration-200"
            >
              <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
                <span className="text-xl sm:text-2xl flex-shrink-0">{item.icon}</span>
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                    Question {index + 1}
                  </p>
                  <p className="text-sm sm:text-base text-gray-800">{item.question}</p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-1 sm:gap-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isActive =
                    star <=
                    (hoveredRating[item.key] || ratings[item.key] || 0);
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingClick(item.key, star)}
                      onMouseEnter={() => handleRatingHover(item.key, star)}
                      onMouseLeave={() => handleRatingLeave(item.key)}
                      className="transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 rounded-full p-0.5 sm:p-1"
                      disabled={isSubmitting}
                    >
                      <Star
                        className={`w-7 h-7 sm:w-10 sm:h-10 ${
                          isActive
                            ? "fill-yellow-400 text-yellow-400"
                            : "fill-gray-200 text-gray-300"
                        } transition-colors duration-200`}
                      />
                    </button>
                  );
                })}
              </div>
              {ratings[item.key] > 0 && (
                <p className="text-center text-xs sm:text-sm text-teal-600 font-medium mt-2">
                  {ratings[item.key]} / 5 stars
                </p>
              )}
            </div>
          ))}
        </div>

        <DialogFooter className="gap-2 flex-col sm:flex-row">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-semibold rounded-lg hover:from-teal-600 hover:to-cyan-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Submitting...
              </>
            ) : (
              "Submit Feedback"
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
