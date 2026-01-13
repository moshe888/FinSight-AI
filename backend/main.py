import os
import uvicorn
import tempfile
import traceback
import sys
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
 

# בדיקת ספריות קריטיות לפני טעינת האפליקציה
try:
    import tiktoken
    print("✅ 'tiktoken' is installed.")
except ImportError:
    print("❌ ERROR: 'tiktoken' is missing. Please run: pip install tiktoken")
    sys.exit(1)

try:
    import faiss
    print("✅ 'faiss' is installed.")
except ImportError:
    print("❌ ERROR: 'faiss-cpu' is missing. Please run: pip install faiss-cpu")
    sys.exit(1)

# LangChain Imports
from langchain_community.document_loaders import PDFMinerLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import FAISS
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

from dotenv import load_dotenv

# טעינת משתני סביבה
load_dotenv()

app = FastAPI(title="FinSight AI Backend")

# הגדרת CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# בדיקת מפתח API בעלייה
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    print("❌ CRITICAL ERROR: OPENAI_API_KEY is missing in .env file!")
    # לא עוצרים כאן כדי לאפשר דיבוג, אבל נתריע
else:
    print(f"✅ API Key loaded: {OPENAI_API_KEY[:5]}...{OPENAI_API_KEY[-4:]}")

vector_db = None

@app.get("/")
async def root():
    return {"message": "FinSight AI API is running"}

@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    global vector_db
    print(f"\n📥 --- START UPLOAD: {file.filename} ---")

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    # בדיקה חוזרת למפתח
    if not OPENAI_API_KEY:
        print("❌ ERROR: No API Key found during upload request.")
        raise HTTPException(status_code=500, detail="OpenAI API Key is missing on server.")

    tmp_path = None
    try:
        # 1. שמירת קובץ זמנית
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name
        
        print(f"📄 File saved to temp path: {tmp_path}")

        # 2. טעינת ה-PDF
        print("⏳ Loading PDF with PyPDFLoader...")
        loader = PDFMinerLoader(tmp_path)
        documents = loader.load()
        if not documents:
            raise ValueError("PDF content is empty or could not be read.")
        print(f"✅ Loaded {len(documents)} pages")

        # 3. חלוקה ל-Chunks
        print("✂️ Splitting text...")
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=150
        )
        splits = text_splitter.split_documents(documents)
        if not splits:
            raise ValueError("No text chunks created from PDF.")
        print(f"✅ Created {len(splits)} text chunks")

        # 4. יצירת וקטורים ושמירה ב-FAISS
        print("🧠 Generating Embeddings (calling OpenAI API)...")
        # העברת המפתח בצורה מפורשת
        embeddings = OpenAIEmbeddings(
            model="text-embedding-3-small",
            api_key=OPENAI_API_KEY 
        )
        
        vector_db = FAISS.from_documents(splits, embeddings)
        print("✅ Vector Database created successfully")
        
        # ניקוי
        try:
            os.remove(tmp_path)
        except:
            pass
        
        print("🎉 Upload Process Completed Successfully")
        return {
            "status": "success",
            "message": f"File {file.filename} processed successfully",
            "chunks_created": len(splits),
        }

    except Exception as e:
        # הדפסת השגיאה המלאה לטרמינל
        print("\n❌ CRITICAL ERROR DURING UPLOAD:")
        traceback.print_exc()
        print(f"Error message: {str(e)}\n")
        
        # החזרת השגיאה המפורטת ללקוח (לצורך דיבוג)
        raise HTTPException(status_code=500, detail=f"Server Error: {str(e)}")

@app.get("/query")
async def query_financials(question: str):
    global vector_db

    if vector_db is None:
        raise HTTPException(status_code=400, detail="Please upload a PDF first")

    try:
        print(f"\n❓ Querying: {question}")
        docs = vector_db.similarity_search(question, k=4)
        
        if not docs:
            print("⚠️ No relevant documents found.")
            return {"answer": "I couldn't find relevant info in the document."}

        context = "\n\n".join([d.page_content for d in docs])
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are a financial analyst assistant. Answer purely based on the provided context."),
            ("human", "Context:\n{context}\n\nQuestion:\n{question}")
        ])

        # העברת המפתח בצורה מפורשת
        llm = ChatOpenAI(
            model="gpt-4o", 
            temperature=0,
            api_key=OPENAI_API_KEY
        )
        chain = prompt | llm | StrOutputParser()

        answer = chain.invoke({"context": context, "question": question})
        print("✅ Answer generated")

        return {"answer": answer}

    except Exception as e:
        print("\n❌ ERROR DURING QUERY:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Query Error: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)