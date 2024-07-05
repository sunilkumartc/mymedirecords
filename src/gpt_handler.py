import time
import openai
from utils import read_pdf1, read_pdf2,add_test_status
from config import OPEN_AI_API_KEY, tests, PersonalDetails
import json

openai.api_key = OPEN_AI_API_KEY


class GPTHandler:
    def __init__(self):

        self.API_RETRIES = 5
        self.RETRY_SLEEP = 40
        self.result_ = dict()
        self.result_["PersonalDetails"] = PersonalDetails
        for key in tests.keys():
            self.result_[key] = "TBD"
        json_object = json.dumps(self.result_)
        self.result_form = str(json_object)

    def gpt_api(self, gpt_request):
        for i in range(0, self.API_RETRIES):
            try:
                gpt_response = openai.ChatCompletion.create(
                    model="gpt-3.5-turbo-16k",
                    # model="gpt-4-turbo-preview",
                    messages=gpt_request,
                    temperature=0,
                    # max_tokens=2000,
                )
                # print("GPT response::")
                # print(gpt_response)
                return {"content": gpt_response['choices'][0]['message']['content'],
                        "completion_tokens": gpt_response['usage']['completion_tokens']}

            except openai.error.APIError as e:
                print(f"OpenAI API returned an API Error: {e}")
            except openai.error.APIConnectionError as e:
                print(f"Failed to connect to OpenAI API: {e}")
            except openai.error.RateLimitError as e:
                print(f"OpenAI API request exceeded rate limit: {e}")
            time.sleep(self.RETRY_SLEEP)
        return {"content": "Error",
                "completion_tokens": 1}

    def extract_data(self, text=''):
        if text == '':
            return None

        role = [{"role": "system",
                 "content": f'''Extract test values from medical report text, and fill(only testValue and valueStatus)\
                  this given json file: {self.result_form}. '''} ,
                {"role": "user", "content": text}]
        output = self.gpt_api(role)
        return output


if __name__ == "__main__":
    #data = read_pdf("/Users/alakhs/Desktop/alakh_reports/report_v2.pdf")
    file_path = "test1.pdf"
    project_id = "model-overview-221912"
    location = "us"  # Processor location
    processor_id = "8b4f20e83e29fb7f"
    #data1 = read_pdf1(file_path, project_id, location, processor_id)
    data1 = read_pdf2(project_id, location, processor_id, file_path )
    #print(data)
    for data in data1:
        # Process each text
        # Example: print each text
        print(data)
        gpt = GPTHandler()
        out = gpt.extract_data(data)
        print(out)
        import json
        # print(out['content'])
        print(json.loads(out['content']))  # [8:-3]))
        output = add_test_status(json.loads(out['content']))
        print(output)
        # Example usage
    
