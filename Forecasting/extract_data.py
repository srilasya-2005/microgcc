import docx
import pandas as pd
import json
import os

def read_docx(file_path):
    doc = docx.Document(file_path)
    full_text = []
    for para in doc.paragraphs:
        full_text.append(para.text)
    return '\n'.join(full_text)

import datetime

def json_serial(obj):
    """JSON serializer for objects not serializable by default json code"""
    if isinstance(obj, (datetime.datetime, datetime.date)):
        return obj.isoformat()
    if isinstance(obj, float) and (obj != obj): # handle NaN
        return None
    raise TypeError ("Type %s not serializable" % type(obj))

def read_xlsx(file_path):
    xls = pd.ExcelFile(file_path)
    sheets_data = {}
    for sheet_name in xls.sheet_names:
        df = pd.read_excel(xls, sheet_name=sheet_name)
        sheets_data[sheet_name] = df.head(100).to_dict(orient='records')
    return sheets_data

docx_path = 'Case - Study - Forecasting.docx'
xlsx_path = 'Forecasting Case- Study.xlsx'

result = {
    "docx_content": read_docx(docx_path),
    "xlsx_preview": read_xlsx(xlsx_path)
}

with open('case_study_data.json', 'w') as f:
    json.dump(result, f, default=json_serial, indent=2)

print("Done")
