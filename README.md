📊 FinSight AI - Financial Report Analyzer (RAG)FinSight AI is a professional tool designed to analyze financial PDF reports using Retrieval-Augmented Generation (RAG).By combining FastAPI, Angular 18, and OpenAI's GPT-4o, it allows users to upload complex financial documents and receive instant, context-aware insights.🛠️ Tech StackBackend: Python (FastAPI), LangChain, PDFMiner, FAISS (Vector DB).Frontend: Angular 18+, Tailwind CSS, Signals API.AI: OpenAI GPT-4o & Text Embeddings.🚀 Getting Started (הוראות הרצה)Follow these steps to get the project up and running on your local machine.1. Clone the Repository (הורדת הפרויקט)git clone [https://github.com/your-username/FinSight-AI.git](https://github.com/your-username/FinSight-AI.git)
cd FinSight-AI
2. Backend Setup (הגדרת צד שרת)Navigate to the backend folder and set up a virtual environment:cd backend
python -m venv venv

# Activate Virtual Environment:
# On Windows:
.\venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies:
pip install -r requirements.txt
(If you don't have a requirements.txt, run the install command from the manual provided).Environment Variables:Create a .env file in the backend directory:OPENAI_API_KEY=your_openai_api_key_here
3. Frontend Setup (הגדרת צד לקוח)Open a new terminal window:cd finsight-ui
npm install
4. Running the Application (הרצת המערכת)Start the Backend:# Inside the backend folder with venv active:
python -m uvicorn main:app --reload --port 8000
Start the Frontend:# Inside the finsight-ui folder:
ng serve
Open your browser at: http://localhost:4200💡 How it Works (איך זה עובד?)Upload: User uploads a financial PDF.Parsing: The system uses PDFMiner to extract high-accuracy text.Indexing: Text is split into chunks and converted into vectors using OpenAI Embeddings.Storage: Vectors are stored in a FAISS vector database.Retrieval: When a question is asked, the system finds the most relevant chunks.Generation: GPT-4o processes the context and the question to provide a professional financial answer.🤝 ContributingContributions, issues, and feature requests are welcome!Feel free to check the issues page.📜 LicenseThis project is MIT licensed.Created by [Your Name]
