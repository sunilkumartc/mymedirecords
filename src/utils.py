import PyPDF2
from datetime import datetime
from config import tests
import re
from PyPDF2 import PdfReader,PdfWriter


from google.cloud import documentai_v1beta3 as documentai

def read_pdf1(project_id, location, processor_id, file_path ):
    read_text = []
    # Instantiates a client
    client = documentai.DocumentProcessorServiceClient()

    # The full resource name of the processor, e.g.:
    # projects/project-id/locations/location/processor/processor-id
    # You must create new processors in the Cloud Console first
    name = f"projects/{project_id}/locations/{location}/processors/{processor_id}"
    with open(file_path, "rb") as file:
        # Use PdfReader to read the PDF
        pdf_reader = PdfReader(file)
        
        # Iterate over each page in the PDF
        for page_number, page in enumerate(pdf_reader.pages, 1):
            # Extract text from the page
            output = PdfWriter()
            output.add_page(page)

            out_file_path = f"outputs/{file_path[:-4]}_{page_number}.pdf"
            with open(out_file_path, "wb") as output_stream:
                output.write(output_stream)
            
            with open(out_file_path, "rb") as file1:

                document = {"content": file1.read(), "mime_type": "application/pdf"}

                # Configure the process request
                request = {"name": name, "document": document}

                # Use the Document AI client synchronous endpoint to process the request
                result = client.process_document(request=request)
                read_text.append(result.document.text)
                print(f"Page {page_number} processing complete.")
                print(result.document.text)
                print('------------------------')

    return read_text



def read_pdf2(project_id, location, processor_id, file_path):
    read_text = []
    
    # Instantiates a client
    client = documentai.DocumentProcessorServiceClient()

    # The full resource name of the processor
    name = f"projects/{project_id}/locations/{location}/processors/{processor_id}"

    with open(file_path, "rb") as file:
        # Read the entire PDF file
        pdf_content = file.read()

        # Configure the document request
        document = {"content": pdf_content, "mime_type": "application/pdf"}

        # Configure the process request
        request = {"name": name, "document": document}

        # Use the Document AI client synchronous endpoint to process the request
        result = client.process_document(request=request)
        
        # Append the extracted text to the list
        read_text.append(result.document.text)
    
    return read_text

# Function to process the PDF file
def read_pdf(file_path):
    # Add your PDF processing logic here
    with open(file_path, 'rb') as pdf_file:
        text_data = []
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        num_pages = len(pdf_reader.pages)
        for i in range(0, num_pages):
            pageObj = pdf_reader.pages[i]
            text = pageObj.extract_text()
            text_data.append(text)
    data = "\n\n".join(text_data)
    return data


def convert_to_timestamp(input_date):
    # Convert input date string to a datetime object
    input_datetime = datetime.strptime(input_date, '%d/%m/%Y')

    # Format the datetime object as a string in the PostgreSQL timestamp format
    postgres_timestamp = input_datetime.strftime('%Y-%m-%d %H:%M:%S')

    return postgres_timestamp


def convert_to_postgres_timestamp(date_string):
    formats_to_try = [
        "%d/%m/%Y",
        "%d/%b/%Y",
        "%d/%B/%Y"
        # Add more formats as needed
    ]

    for date_format in formats_to_try:
        try:
            # Convert input date string to a datetime object
            input_datetime = datetime.strptime(date_string, '%d/%m/%Y')

            # Format the datetime object as a string in the PostgreSQL timestamp format
            postgres_timestamp = input_datetime.strftime('%Y-%m-%d %H:%M:%S')
            return postgres_timestamp
        except ValueError:
            # If parsing fails with the current format, try the next one
            pass

    # If none of the formats work, return None
    return datetime.now().strftime('%Y-%m-%d %H:%M:%S')


def extract_first_number(text):
    match = re.match(r"[-+]?\d*\.\d+|[-+]?\d+", text)
    if match:
        return float(match.group())
    else:
        return None


def add_test_status(result):
    output_ = dict()
    output_['PersonalDetails'] = result["PersonalDetails"]
    gender = output_['PersonalDetails'][0]['Gender']
    for key in result:
        if key == "PersonalDetails":
            continue
        status = "normal"
        if result[key] == "TBD":
            continue
        value = extract_first_number(result[key])
        if value is None:
            continue
        if key in tests:
            test_range_ = tests[key]
            if "min" in test_range_:
                if isinstance(test_range_["min"], dict):
                    min_value = test_range_["min"].get(gender, test_range_["min"].get("Male"))
                else:
                    min_value = test_range_["min"]
                if value <= min_value:
                    status = "low"
            if "max" in test_range_:
                if isinstance(test_range_["max"], dict):
                    max_value = test_range_["max"].get(gender, test_range_["max"].get("Male"))
                else:
                    max_value = test_range_["max"]
                if value >= max_value:
                    status = "high"
        output_[key] = {"testValue": value, "testStatus": status}
    return output_
