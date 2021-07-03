FROM python:3

WORKDIR /usr/src/app

RUN pip install flask

COPY . .

ENV FLASK_APP=server.py

CMD [ "flask", "run", "--host=0.0.0.0"]