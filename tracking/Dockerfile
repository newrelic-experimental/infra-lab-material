FROM python:3.9.1

WORKDIR /app

COPY requirements.txt /app/

RUN pip install -r requirements.txt

COPY src/* /app/

CMD [ "python", "app.py" ]