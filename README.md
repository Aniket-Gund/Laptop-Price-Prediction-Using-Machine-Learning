Laptop Price Prediction Using Machine Learning

Live Link: https://laptop-price-prediction-using-machine-fue5.onrender.com/

Project Overview:

This project focuses on building a Machine Learning pipeline to predict laptop prices based on hardware specifications and configuration features. The system processes raw laptop data, performs data validation and transformation, trains multiple models, evaluates their performance, and deploys the best-performing model for prediction.

The project is designed using a modular pipeline architecture to simulate an industry-level ML workflow, including data ingestion, preprocessing, model training, evaluation, and prediction.

Problem Statement

Laptop prices vary significantly depending on specifications such as processor type, RAM, storage, GPU, screen size, and brand. Manually estimating a fair laptop price based on specifications is difficult.

This project aims to build a machine learning model that can predict the price of a laptop based on its features.

Key Features

End-to-end Machine Learning pipeline

Data validation and preprocessing

Feature engineering and transformation

Model training and evaluation

Automatic best model selection

Batch prediction support

Modular and scalable project structure

Logging and exception handling

Docker support for containerization

Technologies Used
Programming Language

Python

Libraries

Pandas

NumPy

Scikit-learn

Joblib

Visualization & Analysis

Matplotlib

Seaborn

Deployment & Tools

Docker

GitHub

Logging & custom exception handling

Project Architecture

The project follows a modular structure similar to production-level ML systems.

DS_PROJECT
│
├── artifacts
│   ├── model
│   ├── raw
│   ├── transformed
│   └── pipeline_summary.json
│
├── logs
│   └── project.log
│
├── prediction
│   └── models
│
├── src
│   └── components
│       ├── data_ingestion.py
│       ├── data_validation.py
│       ├── data_transformation.py
│       ├── model_trainer.py
│       ├── model_evaluation.py
│       └── model_pusher.py
│
├── pipeline
│   └── training_pipeline.py
│
├── prediction
│   └── batch_prediction.py
│
├── templates
│   └── index.html
│
├── static
│   ├── css
│   └── js
│
├── app.py
├── main.py
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
└── README.md
Machine Learning Workflow

The project follows these steps:

1 Data Ingestion

Loads the raw dataset and stores it in the artifacts directory.

2 Data Validation

Validates dataset structure, schema, and missing values.

3 Data Transformation

Performs preprocessing such as:

Encoding categorical variables

Feature scaling

Feature selection

4 Model Training

Multiple regression models are trained and compared.

5 Model Evaluation

Models are evaluated based on performance metrics, and the best model is selected.

6 Model Pushing

The best model is saved for future predictions.

Model Output

The trained model and preprocessing pipeline are stored in the artifacts folder.

artifacts/model/
    best_model.joblib
    model_metrics.json
Running the Project
1 Clone the Repository
git clone https://github.com/Aniket-Gund/Laptop-Price-Prediction-Using-Machine-Learning.git
2 Navigate to the Project Directory
cd Laptop-Price-Prediction-Using-Machine-Learning
3 Create Virtual Environment
python -m venv venv
4 Activate Environment

Windows

venv\Scripts\activate

Linux / Mac

source venv/bin/activate
5 Install Dependencies
pip install -r requirements.txt
6 Run Training Pipeline
python main.py
7 Run Application
python app.py
Prediction

Users can input laptop specifications through the interface, and the trained model predicts the estimated laptop price.

Dataset

The dataset contains various laptop specifications such as:

Brand

CPU

Battery

RAM

Storage

GPU

Screen Size

Resolution

Type

TouchScreen

Operating System

Weight

Price

Logging and Exception Handling

The project includes a custom logging system to track pipeline execution and a centralized exception handling module for better debugging.

Docker Support

The project includes Docker configuration to containerize the application.

Build the Docker image:

docker build -t laptop-price-prediction .

Run the container:

docker run -p 5000:5000 laptop-price-prediction


Author

Aniket Gund
Electronics & Telecommunication Engineer
Aspiring Data Scientist
