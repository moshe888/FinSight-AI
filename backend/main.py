import os
import uvicorn
import tempfile
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import FAISS
from langchain.chains import RetrievalQA
from dotenv import load_dotenv

 load_dotenv()

 app = FastAPI(title="FinSight AI Backend")

 app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

 openai_api_key = os.getenv("OPENAI_API_KEY")
if not openai_api_key:
    print("WARNING: OpenAI API Key not found! Please set it in .env file.")

 vector_db = None

@app.get("/")
async def root():
    return {"message": "FinSight AI API is running"}

@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    global vector_db
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Please upload PDF files only")

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name

        loader = PyPDFLoader(tmp_path)
        documents = loader.load()

        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=150)
        splits = text_splitter.split_documents(documents)

        embeddings = OpenAIEmbeddings()
        vector_db = FAISS.from_documents(splits, embeddings)
        
        os.remove(tmp_path)
        return {"status": "success", "message": f"File {file.filename} processed", "chunks": len(splits)}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/query")
async def query_financials(question: str):
    global vector_db
    if vector_db is None:
        raise HTTPException(status_code=400, detail="Upload a PDF first")

    try:
        llm = ChatOpenAI(model_name="gpt-4o", temperature=0)
        qa_chain = RetrievalQA.from_chain_type(
            llm=llm,
            chain_type="stuff",
            retriever=vector_db.as_retriever(search_kwargs={"k": 4})
        )
        response = qa_chain.invoke(question)
        return {"answer": response["result"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)