import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable is required");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ParsedResume {
  fullName: string;
  title: string;
  location: string;
  email: string;
  phone: string;
  skills: string[];
  experienceYears: number;
  education: string;
  bio: string;
  certifications: string[];
}

export async function parseResume(resumeText: string): Promise<ParsedResume> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are a resume parser that extracts structured information from resumes. 
          Parse the resume text and return a JSON object with the following structure:
          {
            "fullName": "string",
            "title": "string - job title or professional title",
            "location": "string - city, state format",
            "email": "string",
            "phone": "string",
            "skills": ["array of technical skills"],
            "experienceYears": "number - total years of experience",
            "education": "string - highest degree and institution",
            "bio": "string - 2-3 sentence professional summary",
            "certifications": ["array of certifications"]
          }
          
          If any field is not found, use reasonable defaults or empty values.
          For experienceYears, calculate based on work history dates.
          For skills, extract technical skills, tools, and technologies mentioned.
          For bio, create a concise professional summary based on the resume content.`
        },
        {
          role: "user",
          content: `Parse this resume:\n\n${resumeText}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const parsed = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      fullName: parsed.fullName || "Unknown",
      title: parsed.title || "Professional",
      location: parsed.location || "Location TBD",
      email: parsed.email || "",
      phone: parsed.phone || "",
      skills: Array.isArray(parsed.skills) ? parsed.skills : [],
      experienceYears: typeof parsed.experienceYears === 'number' ? parsed.experienceYears : 0,
      education: parsed.education || "Education information not provided",
      bio: parsed.bio || "Experienced professional with proven expertise in their field.",
      certifications: Array.isArray(parsed.certifications) ? parsed.certifications : [],
    };
  } catch (error) {
    console.error("Error parsing resume:", error);
    throw new Error("Failed to parse resume");
  }
}