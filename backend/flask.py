import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import openai

app = Flask(__name__)
CORS(app)

openai.api_key = os.getenv("OPENAI_API_KEY")

@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.json
        prompt = data.get("prompt")

        completion = openai.ChatCompletion.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are a portfolio copilot. Answer product design questions conversationally and concisely.",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
        )

        reply = completion.choices[0].message.content
        return jsonify({"reply": reply})
    except Exception as error:
        return jsonify({"error": str(error)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=3001)
