# flask_app.py - Main Flask Application
from flask import Flask, render_template, request, jsonify, send_file
import pandas as pd
import joblib
from pathlib import Path
import json
import io

app = Flask(__name__)

# Paths configuration
PROJECT_ROOT = Path.cwd()
PREPROCESSOR_PATH = PROJECT_ROOT / "artifacts" / "transformed" / "preprocessor.joblib"
MODEL_PATH = PROJECT_ROOT / "prediction" / "models" / "models" / "current_model.joblib"
FEATURE_LIST_PATH = PROJECT_ROOT / "artifacts" / "transformed" / "feature_list.json"
TRAIN_CSV_PATH = PROJECT_ROOT / "artifacts" / "transformed" / "train.csv"

# Global variables for loaded artifacts
preprocessor = None
model = None
features = None
num_cols = []
cat_cols = []
training_uniques = {}

def load_artifacts():
    """Load model, preprocessor, and feature metadata"""
    global preprocessor, model, features, num_cols, cat_cols
    
    if not PREPROCESSOR_PATH.exists():
        raise FileNotFoundError(f"Preprocessor not found at {PREPROCESSOR_PATH}")
    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"Model not found at {MODEL_PATH}")
    
    preprocessor = joblib.load(PREPROCESSOR_PATH)
    model = joblib.load(MODEL_PATH)
    
    # Load feature list
    if FEATURE_LIST_PATH.exists():
        with open(FEATURE_LIST_PATH, "r") as f:
            fl = json.load(f)
        num_cols = fl.get("num_cols", [])
        cat_cols = fl.get("cat_cols", [])
        features = num_cols + cat_cols
    else:
        # Fallback: infer from train csv
        if TRAIN_CSV_PATH.exists():
            train_df = pd.read_csv(TRAIN_CSV_PATH)
            features = [c for c in train_df.columns.tolist() if c != "Price_INR"]
            num_cols = train_df.select_dtypes(include=['int64', 'float64']).columns.tolist()
            num_cols = [c for c in num_cols if c in features]
            cat_cols = [c for c in features if c not in num_cols]
        else:
            features = []
            num_cols = []
            cat_cols = []
    
    return True

def load_training_unique_values():
    """Load unique values from training data for dropdowns"""
    global training_uniques
    
    if TRAIN_CSV_PATH.exists():
        df = pd.read_csv(TRAIN_CSV_PATH)
        for col in df.columns:
            if col == "Price_INR":
                continue
            if pd.api.types.is_numeric_dtype(df[col].dtype):
                continue
            
            uniques = df[col].dropna().unique().tolist()
            try:
                freq = df[col].value_counts().to_dict()
                uniques_sorted = sorted(uniques, key=lambda x: (-freq.get(x, 0), str(x)))
            except Exception:
                uniques_sorted = sorted([str(u) for u in uniques])
            
            training_uniques[col] = [str(u) for u in uniques_sorted]
    
    return training_uniques

def get_numeric_defaults():
    """Get default values for numeric fields"""
    defaults = {}
    if TRAIN_CSV_PATH.exists():
        df = pd.read_csv(TRAIN_CSV_PATH)
        for col in num_cols:
            if col in df.columns:
                defaults[col] = {
                    'median': float(df[col].median()),
                    'is_int': pd.api.types.is_integer_dtype(df[col].dtype)
                }
    return defaults

def predict_single(input_data):
    """Make prediction for single input"""
    df = pd.DataFrame([input_data], columns=features)
    X_t = preprocessor.transform(df)
    pred = model.predict(X_t)
    return float(pred[0])

def predict_batch(df_input):
    """Make predictions for batch input"""
    df = df_input.copy()
    if "Price_INR" in df.columns:
        df = df.drop(columns=["Price_INR"])
    
    X_t = preprocessor.transform(df)
    preds = model.predict(X_t)
    df["Predicted_Price_INR"] = preds
    return df

# Initialize artifacts on startup
try:
    load_artifacts()
    load_training_unique_values()
    print("✓ Model and artifacts loaded successfully")
except Exception as e:
    print(f"✗ Error loading artifacts: {e}")

@app.route('/')
def home():
    """Render home page"""
    numeric_defaults = get_numeric_defaults()
    return render_template('index.html', 
                         features=features,
                         num_cols=num_cols,
                         cat_cols=cat_cols,
                         training_uniques=training_uniques,
                         numeric_defaults=numeric_defaults)

@app.route('/predict', methods=['POST'])
def predict():
    """Handle single prediction request"""
    try:
        input_data = {}
        
        # Extract form data
        for feature in features:
            value = request.form.get(feature)
            
            if feature in num_cols:
                # Convert to appropriate numeric type
                if TRAIN_CSV_PATH.exists():
                    df = pd.read_csv(TRAIN_CSV_PATH, usecols=[feature])
                    if pd.api.types.is_integer_dtype(df[feature].dtype):
                        input_data[feature] = int(float(value))
                    else:
                        input_data[feature] = float(value)
                else:
                    input_data[feature] = float(value)
            else:
                # Categorical
                input_data[feature] = str(value)
        
        # Make prediction
        prediction = predict_single(input_data)
        
        return jsonify({
            'success': True,
            'prediction': round(prediction, 2),
            'input_data': input_data
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/batch_predict', methods=['POST'])
def batch_predict():
    """Handle batch prediction from CSV upload"""
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No file selected'}), 400
        
        # Read CSV
        df_input = pd.read_csv(file)
        
        # Make predictions
        df_output = predict_batch(df_input)
        
        # Convert to CSV for download
        output = io.StringIO()
        df_output.to_csv(output, index=False)
        output.seek(0)
        
        return send_file(
            io.BytesIO(output.getvalue().encode()),
            mimetype='text/csv',
            as_attachment=True,
            download_name='predictions.csv'
        )
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/health')
def health():
    """Health check endpoint for Render"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'preprocessor_loaded': preprocessor is not None,
        'features_count': len(features) if features else 0
    })

if __name__ == '__main__':
    # For local development
    app.run(debug=True, host='0.0.0.0', port=5000)