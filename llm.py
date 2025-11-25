import openai
import os

openai.api_key = os.environ.get("OPENAI_API_KEY")


def get_medicine_info(medicines: list):
    """
    Query OpenAI API for medicine info
    """
    if not medicines:
        return {}

    prompt = f"Provide detailed information (effects, dosage, benefits, side effects) for the following medicines: {', '.join(medicines)}"

    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are a helpful medical assistant."},
            {"role": "user", "content": prompt}
        ],
        temperature=0
    )

    return response['choices'][0]['message']['content']
