import os
import time
import json
from pathlib import Path
from dotenv import load_dotenv
from groq import Groq
from pydantic import BaseModel, Field
from pypdf import PdfReader
from docx import Document
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()
my_api_key=os.getenv("GROQ_API_KEY")

if not my_api_key:
    raise ValueError("API key kaha hai bhai")

client=Groq(api_key=my_api_key)
model = "openai/gpt-oss-120b"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173" , 
                    "https://ai-portfolio-bot-navy.vercel.app",],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Experience(BaseModel):
    company: str | None = None
    role: str | None = None
    duration: str | None = None
    description: str | None = None
    skills_used: list[str] = []

class Resume(BaseModel):
    name: str | None = None
    email: str | None = None
    phone: str | None = None

    total_experience_years: float | None = None

    skills: list[str] = []
    experiences: list[Experience] = []
    education: list[str] = []
    projects: list[str] = []
    certifications: list[str] = []


class ChatRequest(BaseModel):
    question: str

def ask_candidate(question : str , resume: Resume):

    system_prompt = f"""
you are an ai assistant representing  a job candidate,
below is everything you know about the candidate
{resume.model_dump_json(indent = 2 )}

rules:
answer only using this function 
dont give answer by you intent
never hellucinate
if the information is unavailable then just say 
"I have no information to answer this question"
answer as if hr is interviewing this candidate


IMPORTANT: Respond with plain conversational text only.
Do NOT respond with JSON, function calls, tool calls, or any structured
format like {{"name": ..., "arguments": ...}}. Just write your answer
as normal sentences, like a person speaking in an interview.

"""
    response = client.chat.completions.create(
        model = model ,
        messages = [{
            "role" : "system",
            "content" : system_prompt

            },
            {
                "role" : "user",
                "content" : question
            } 
        ]
    )


    return response.choices[0].message.content



resume_schema = Resume.model_json_schema()

#parse_resume
def parse_resume(resume_text):
    system_prompt = f"""
    You are an expert resume parser.

    Extract information from the resume based on its meaning,
    not only based on exact section headings.

    Different resumes may use different headings.

    For example:
    - Experience
    - Professional Experience
    - Work History
    - Employment
    - Internships

    These may all contain relevant experience.

    Skills may also appear in the skills section, work experience,
    internships or projects.

    Return ONLY valid JSON matching this schema:

    {resume_schema}

    Important rules:

    1. Do not invent information.
    2. If a value is not available, return null.
    3. If a list has no information, return an empty list.
    4. Include internships inside experiences.
    5. Extract skills mentioned across the entire resume.
    """
    user_prompt = f"""
    Parse the following resume:

    {resume_text}
    """
    message_system={
        "role" : "system",
        "content" : system_prompt
    }
    message_user={
        "role" : "user",
        "content" : user_prompt
    }
    messages=[message_system, message_user]
    response_format={
        "type": "json_object"
    }
    response=client.chat.completions.create(model=model, messages=messages, response_format=response_format)
    raw_output = response.choices[0].message.content
    data = json.loads(raw_output)
    resume = Resume(**data)
    return resume


def read_pdf(file_path : Path):
    reader = PdfReader(file_path)

    text = ""

    for page in reader.pages:
        page_text = page.extract_text()

        if page_text:
            text += page_text + "\n"

    return text

@app.get("/")
def home():
    return {
        "message" : "Go to the '/chat' for more information"
    }



@app.post("/chat")
def chat(request : ChatRequest):
    resume_text = read_pdf(Path("my_resume.pdf"))
    json_resume = parse_resume(resume_text)
    answer = ask_candidate(request.question , json_resume)
    return {
        "answer" : answer
    }




