FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --upgrade pip \
    && pip install -r requirements.txt \
    && pip install --upgrade google-api-python-client google-auth google-auth-httplib2 google-auth-oauthlib



COPY . .

ENV FLASK_ENV=development

CMD ["FLASK", "run.py"]
