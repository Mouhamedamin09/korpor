# for loading data and other simple tasks
import json  # JSON data handling
import os  # Operating system
from langdetect import detect  # Language detection
from dotenv import load_dotenv  # Load environment variables (from .env file)

# for llm and embeddings
from langchain_chroma import Chroma  # Vectorstore for embeddings
from langchain_huggingface import HuggingFaceEmbeddings  # Embeddings from Hugging Face models
from langchain.schema import Document  # Document schema for LangChain
from langchain_core.prompts import ChatPromptTemplate  # Template for chat prompts
from langchain_core.runnables import RunnablePassthrough  # Passthrough for runnables
from langchain_core.output_parsers import StrOutputParser  # String output parser

# for voice generation
from elevenlabs.client import ElevenLabs  # ElevenLabs API client for voice generation
from langchain_google_genai import ChatGoogleGenerativeAI  # Google Generative AI for chat

# for caching
import numpy as np  # Numerical operations
from sklearn.feature_extraction.text import TfidfVectorizer  # TF-IDF vectorization
from sklearn.metrics.pairwise import cosine_similarity  # Cosine similarity calculation

# For API
from flask import Flask, request, jsonify  # Flask for creating API

# Initialize Flask app
app = Flask(__name__)

def load_data(json_file):
    try:
        with open(json_file, 'r', encoding='utf-8') as file:
            json_data = json.load(file)
            # Convert JSON into LangChain Documents
            data = []
            for item in json_data:
                # Include both question and answer in the content
                content = f"QUESTION: {item['question']}\nANSWER: {item['answer']}"
                data.append(Document(
                    page_content=content,
                    metadata={
                        "section": item['section'],
                        "question": item['question'],
                        "answer": item['answer']  # Store answer separately in metadata
                    }
                ))
    except:
        print("Error loading ",json_file," file")
    return data

def load_persist_directory(persist_directory,embeddings,file_name):
    if os.path.exists(persist_directory):
        print("Vectorstore exist , loading ...")
        vectorstore = Chroma(persist_directory=persist_directory, embedding_function=embeddings)
        print("Vectoresore is loaded")
    else:
        data=load_data(file_name)
        try:
            print("Creating new vectorstore")
            vectorstore = Chroma.from_documents(documents=data, embedding=embeddings, persist_directory=persist_directory)
            print("New vectorstore created and persisted!")
        except:
            print("Error creating new vectorstore")
    return vectorstore
# Language Detection Function
def detect_language(text):
    try:
        lang = detect(text)
        return lang if lang in ["en", "fr", "ar"] else "en"
    except Exception:
        return "None"
def find_similar_question(query, cache_file_path, threshold=0.7,update: bool = False):
    """
    Find a similar question in the cache using TF-IDF vectorization
    Args:
        query (str): The user's question
        cache_file_path (str): Path to the JSON cache file
        threshold (float): Minimum similarity score to consider a match
    Returns:
        dict or None: The matched question and answer if found, None otherwise
    """
    # Ensure the cache file exists
    if not os.path.exists(cache_file_path):
        print("Cache file doen't exist")
        print("creating ...")
        with open(cache_file_path, 'w', encoding='utf-8') as f:
            json.dump({}, f)
            print("Cache created sucessfuly")
        return None
    if update == True:
        print("Cache updated")
        cache=None
    # Load the cache
    with open(cache_file_path, 'r', encoding='utf-8') as f:
        cache = json.load(f)
        print("Cache loaded")
    
    # If cache is empty, return None
    if not cache:
        print("Cache is empty")
        return None
    
    # Get all questions from the cache
    cached_questions = list(cache.keys())
    
    # If there's an exact match, return it immediately
    if query.lower() in [q.lower() for q in cached_questions]:
        for q in cached_questions:
            if q.lower() == query.lower():
                return {"question": q, "response": cache[q], "similarity": 1.0}
    
    # Create a list of all texts to compare (query + cached questions)
    all_texts = [query] + cached_questions
    # stop_words='english' removes common English words
    vectorizer = TfidfVectorizer(stop_words='english')
    # Fit and transform all texts to TF-IDF vectors
    tfidf_matrix = vectorizer.fit_transform(all_texts) #each row is a document (question) and columns are the words tha represent that question
    # Get the query vector (first row of the matrix)
    query_vector = tfidf_matrix[0:1]
    # Get vectors for all cached questions
    question_vectors = tfidf_matrix[1:]
    # Calculate cosine similarity between query and all cached questions
    similarities = cosine_similarity(query_vector, question_vectors).flatten()
    # Find the index of the most similar question
    max_similarity_index = np.argmax(similarities)
    max_similarity = similarities[max_similarity_index]
    # If similarity is above threshold, return the match
    if max_similarity >= threshold:
        best_match = cached_questions[max_similarity_index]
        return {
            "question": best_match,
            "response": cache[best_match],
            "similarity": float(max_similarity)
        }
    
    return None

def process_query(query):
    load_dotenv()
    model_name = "models/gemini-2.0-flash"
    cache_file_path="question_cache.json"
    result = find_similar_question(query, cache_file_path)
    if result:
        print(f"Found similar question: '{result['question']}'")
        print(f"Similarity score: {result['similarity']:.2f}")
        print(f"Answer: {result['response']}")
        return result
    else:
        # Create embeddings using HuggingFaceEmbeddings
        embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/paraphrase-multilingual-mpnet-base-v2",
            model_kwargs={'device': 'cpu'}
        )
        #prompts for the llm
        #define our model
        google_key=os.getenv("google_api_key")
        if not google_key:
            print("Google API key not found in environment variables.")
            return {"error": "Service temporarily unavailable. Please try again later."}
        llm = ChatGoogleGenerativeAI(model=model_name,google_api_key=google_key)
        print(f"\nQuery: {query}")
        lang=detect_language(query)
        if lang=="en":
            # persist directory : where we store the vectorstore
            persist_directory_en = "./chroma_db_en"
            language="English"
            vectorstore = load_persist_directory(persist_directory_en,embeddings,'data_en.json')
        elif lang=="fr":
            persist_directory_fr = "./chroma_db_fr"
            vectorstore = load_persist_directory(persist_directory_fr,embeddings,'data_fr.json')
            language="French"
        elif lang=="ar":
            persist_directory_ar = "./chroma_db_ar"
            vectorstore= load_persist_directory(persist_directory_ar,embeddings,'data_ar.json')
            language="Arabic"
        else:
            print("Language not supported")
            return {"error": "Language not supported"}
        print(lang)
        prompt = ChatPromptTemplate.from_template(
        """
        Based on the following context, provide a detailed answer to the user's query.

        Context: {context}
        User Query: {question}
        Response Language: {language}

        Instructions:
        1. Extract the relevant answer from the ANSWER section in the context
        2. YOU MUST RESPOND ONLY IN THE LANGUAGE SPECIFIED AS "Response Language" above
        3. For Arabic, use only Arabic script (العربية)
        4. For French, use only French (Français)
        5. For English, use only English
        6. Present the information in a clear, structured way
        7. Use the exact information from the context without adding external knowledge

        If the query is a general conversation (like greetings, how are you, etc.), respond naturally IN THE SPECIFIED LANGUAGE.
        If the query is about a topic not covered in the context but is within your general knowledge about Tunisian real estate, provide a brief, helpful response IN THE SPECIFIED LANGUAGE.
        If the query is not related to real estate, respond with the equivalent of "I'm specialized in Tunisian real estate. I don't have enough information to answer this question." IN THE SPECIFIED LANGUAGE.
        If no relevant information is found and you cannot provide a general answer, respond with the equivalent of "I don't have enough information to answer this question." IN THE SPECIFIED LANGUAGE.
        """)

        #retriever
        retriever = vectorstore.as_retriever(search_type="similarity",search_kwargs={"k":2})
        chain = (
            {"context":retriever,"question":RunnablePassthrough(),"language":lambda x : language}
            | prompt
            | llm
            | StrOutputParser()
        )
        try:
            # Get the LLM response
            result = chain.invoke(query)
            # Get the retrieved documents separately
            retrieved_docs = vectorstore.similarity_search(query, k=2)   
            if retrieved_docs:
                print('Docs retrieved')
                # Clean and save the LLM response
                """
                cleaning_response = llm.invoke(
                    "Transform this text into a direct informational response without any introductory phrases like 'here's that text' or 'okay'. Remove any AI-like language or meta-commentary. Start directly with the factual content and maintain all the original information in a natural, human-like style:\n\n" + result
                )
                """
                clean_text = result
                try:
                    # Load existing cache
                    with open(cache_file_path, 'r', encoding='utf-8') as f:
                        cache = json.load(f)
                    
                    # Add the new question and answer to the cache
                    cache[query] = clean_text
                    
                    # Save the updated cache
                    with open(cache_file_path, 'w', encoding='utf-8') as f:
                        json.dump(cache, f, indent=2,ensure_ascii=False) #ensure_ascii=False for frensh and arabic letters , indent=2 so every question in a new line
                    print("Added new question and answer to cache")
                except Exception as e:
                    print(f"Failed to save to cache: {str(e)}")
                return({
                "response": clean_text})

            else:
                print("No documents retrieved")
                return{
                "response": "I don't have enough information to answer this question.",
            }
          
        except Exception as e:
            print(f"Error processing query: {str(e)}")
            return {
                "response": "I'm sorry, I encountered an issue while processing your request. Please try again later."
            }
def generate_voice(text):
    try:
        client = ElevenLabs(api_key=os.getenv("ELEVENLABS_API_KEY"))       
        audio = client.text_to_speech.convert(
            text=text,
            voice_id="UgBBYS2sOqTuMpoF3BR0",
            model_id="eleven_multilingual_v2",
            output_format="mp3_44100_128",)
    except:
        print("erreur genearing voice")
        exit
    try:
        audio_file = "answer.mp3"
        audio_path = os.path.join(os.getcwd(), audio_file)
        # Handle the generator by collecting all chunks
        audio_data = b''
        for chunk in audio:
            audio_data += chunk
            # Write the complete audio data to file
            with open(audio_path, "wb") as f:
                f.write(audio_data)
        print(f"\nAudio saved to: {audio_path}")
    except:
        print("errur saving the audio file")
        exit
                

# API endpoint
@app.route('/api/chat', methods=['POST'])  
def chat_endpoint():
    data = request.json
    if not data or 'query' not in data:
        return jsonify({"error": "No query provided"}), 400
    
    query = data['query'].lower()
    voice_enabled = data["voice_enabled"]
    result = process_query(query)
    
    # Handle both string and dict responses
    if isinstance(result, dict):
        response_text = result.get('response', str(result))
    else:
        response_text = str(result)
    
    if voice_enabled:
        generate_voice(response_text)
    
    return jsonify({"response": response_text}), 200
# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "message": "Chatbot API is running"})

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5002, debug=True)
