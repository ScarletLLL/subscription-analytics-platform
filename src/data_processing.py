import pandas as pd
import numpy as np
import os
from pathlib import Path

def standardize_column_names(df):
    """
    Standardize column names to lowercase with underscores
    """
    # Create a copy to avoid modifying original
    df_clean = df.copy()
    
    # Convert column names to lowercase and replace spaces with underscores
    df_clean.columns = df_clean.columns.str.lower().str.replace(' ', '_').str.replace('-', '_')
    
    # Remove special characters and multiple underscores
    df_clean.columns = df_clean.columns.str.replace('[^a-z0-9_]', '', regex=True)
    df_clean.columns = df_clean.columns.str.replace('_{2,}', '_', regex=True)
    
    # Remove leading/trailing underscores
    df_clean.columns = df_clean.columns.str.strip('_')
    
    return df_clean

def force_create_customer_id(df):
    """
    Force create a customer_id column if it doesn't exist
    """
    if 'customer_id' not in df.columns:
        df = df.copy()
        df['customer_id'] = range(len(df))
        print("Force created customer_id column with sequential numbers")
    return df

def find_matching_column(df_columns, possible_names):
    """
    Find the first matching column name from a list of possibilities
    """
    for col in df_columns:
        if col in possible_names:
            return col
    return None

def create_column_mapping(df):
    """
    Create mapping of business terms to actual column names
    """
    # Map common business terms to standardized column names
    column_mapping_rules = {
        'customer_id': ['customer_id', 'customerid', 'customer', 'client_id', 'clientid', 'user_id', 'userid'],
        'revenue': ['revenue', 'amount', 'price', 'total_amount', 'sales', 'income', 'value'],
        'subscription_fee': ['subscription_fee', 'subscription', 'plan_fee', 'monthly_fee', 'fee', 'subscription_amount'],
        'usage_hours': ['usage_hours', 'usage', 'hours', 'time_spent', 'session_time', 'active_time'],
        'support_tickets': ['support_tickets', 'tickets', 'issues', 'support_requests', 'help_requests'],
        'login_frequency': ['login_frequency', 'logins', 'sessions', 'visits', 'frequency'],
        'order_date': ['order_date', 'date', 'created_date', 'subscription_date', 'start_date'],
        'product': ['product', 'service', 'plan', 'package', 'offering'],
        'region': ['region', 'location', 'country', 'area', 'territory'],
        'industry': ['industry', 'sector', 'vertical', 'business_type']
    }
    
    # Create actual column mapping
    actual_column_mapping = {}
    for business_term, possible_names in column_mapping_rules.items():
        matched_col = find_matching_column(df.columns, possible_names)
        if matched_col:
            actual_column_mapping[business_term] = matched_col
    
    return actual_column_mapping

def ensure_customer_id(df, actual_column_mapping):
    """
    Ensure we have a customer_id column
    """
    print(f"DEBUG: Current dataframe columns: {df.columns.tolist()}")
    print(f"DEBUG: Current column mapping: {actual_column_mapping}")
    
    # Check if customer_id already exists in the dataframe
    if 'customer_id' in df.columns:
        actual_column_mapping['customer_id'] = 'customer_id'
        print("Found existing 'customer_id' column")
        return df, actual_column_mapping
    
    # Check if customer_id is already mapped
    if 'customer_id' in actual_column_mapping:
        customer_id_col = actual_column_mapping['customer_id']
        if customer_id_col in df.columns:
            print(f"Using existing mapping: '{customer_id_col}' as customer identifier")
            return df, actual_column_mapping
        else:
            print(f"WARNING: Mapped column '{customer_id_col}' not found in dataframe")
    
    # Look for any column that might be an ID
    id_candidates = []
    for col in df.columns:
        col_lower = col.lower()
        if any(term in col_lower for term in ['id', 'customer', 'client', 'user']):
            id_candidates.append(col)
    
    print(f"DEBUG: ID candidates found: {id_candidates}")
    
    if id_candidates:
        # Use the first candidate
        actual_column_mapping['customer_id'] = id_candidates[0]
        print(f"Using '{id_candidates[0]}' as customer identifier")
    else:
        # Create synthetic customer ID
        print("No suitable ID column found, creating synthetic customer_id")
        df = df.copy()  # Make sure we're working with a copy
        df['customer_id'] = range(len(df))
        actual_column_mapping['customer_id'] = 'customer_id'
        print("Created synthetic customer_id column")
    
    # Final verification
    customer_id_col = actual_column_mapping['customer_id']
    if customer_id_col not in df.columns:
        print(f"CRITICAL: customer_id column '{customer_id_col}' still not found!")
        print(f"Available columns: {df.columns.tolist()}")
        # Force create it
        df = df.copy()
        df['customer_id'] = range(len(df))
        actual_column_mapping['customer_id'] = 'customer_id'
        print("Force created customer_id column")
    
    print(f"DEBUG: Final customer_id column: {actual_column_mapping['customer_id']}")
    print(f"DEBUG: Column exists in dataframe: {actual_column_mapping['customer_id'] in df.columns}")
    
    return df, actual_column_mapping

def clean_data(df, actual_column_mapping):
    """
    Clean the data by handling missing values and converting data types
    """
    print(f"Dataset shape before cleaning: {df.shape}")
    print("Missing values per column:")
    print(df.isnull().sum())
    
    # Remove rows with missing customer_id
    customer_id_col = actual_column_mapping['customer_id']
    df = df.dropna(subset=[customer_id_col])
    
    # Fill missing values in numeric columns with median
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    for col in numeric_cols:
        if df[col].isnull().sum() > 0:
            df[col] = df[col].fillna(df[col].median())
    
    print(f"Dataset shape after cleaning: {df.shape}")
    
    # Convert date columns to datetime if present
    date_columns = [col for col in df.columns if 'date' in col.lower() or 'time' in col.lower()]
    for col in date_columns:
        if col in df.columns:
            df[col] = pd.to_datetime(df[col], errors='coerce')
    
    print(f"Date columns converted: {date_columns}")
    
    return df, date_columns

def create_customer_features(df, actual_column_mapping):
    """
    Create customer-level features for segmentation
    """
    print("Creating customer-level features for segmentation...")
    
    customer_id_col = actual_column_mapping['customer_id']
    
    # Build aggregation dictionary based on available mapped columns
    agg_dict = {}
    for business_term, actual_col in actual_column_mapping.items():
        if business_term != 'customer_id' and actual_col in df.columns:
            col_dtype = df[actual_col].dtype
            
            # Handle numeric columns
            if col_dtype in ['int64', 'float64']:
                agg_dict[actual_col] = ['sum', 'mean', 'count', 'std']
            # Handle datetime columns
            elif 'datetime' in str(col_dtype):
                agg_dict[actual_col] = ['min', 'max', 'count']
            # Handle object/string columns
            elif col_dtype == 'object':
                agg_dict[actual_col] = ['count', 'nunique']
            # Handle boolean columns
            elif col_dtype == 'bool':
                agg_dict[actual_col] = ['sum', 'mean', 'count']
    
    # Add any additional numeric columns not in mapping
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    additional_numeric = [col for col in numeric_cols if col not in agg_dict and col != customer_id_col]
    for col in additional_numeric[:5]:  # Limit to first 5 additional columns
        col_dtype = df[col].dtype
        if col_dtype in ['int64', 'float64']:
            agg_dict[col] = ['sum', 'mean', 'count']
        elif 'datetime' in str(col_dtype):
            agg_dict[col] = ['min', 'max', 'count']
    
    print(f"Aggregation dictionary: {list(agg_dict.keys())}")
    
    # Perform customer-level aggregation
    if agg_dict:
        try:
            customer_features = df.groupby(customer_id_col).agg(agg_dict).reset_index()
            
            # Flatten column names
            new_columns = [customer_id_col]
            for col in customer_features.columns[1:]:
                if isinstance(col, tuple):
                    new_columns.append(f"{col[0]}_{col[1]}")
                else:
                    new_columns.append(col)
            
            customer_features.columns = new_columns
            
            # Remove columns with all NaN or constant values
            customer_features = customer_features.dropna(axis=1, how='all')
            columns_to_drop = []
            for col in customer_features.columns:
                if col != customer_id_col:
                    # Check for constant values or all NaN
                    if customer_features[col].nunique() <= 1 or customer_features[col].isna().all():
                        columns_to_drop.append(col)
            
            if columns_to_drop:
                customer_features = customer_features.drop(columns_to_drop, axis=1)
                print(f"Dropped {len(columns_to_drop)} constant/empty columns")
            
            print(f"Customer features shape: {customer_features.shape}")
            print("Customer features columns:", customer_features.columns.tolist())
            
        except Exception as e:
            print(f"Error in aggregation: {e}")
            print("Falling back to basic features...")
            customer_features = None
    else:
        customer_features = None
    
    # Fallback: create basic features from available numeric columns
    if customer_features is None:
        print("Creating basic customer features from available numeric data...")
        available_numeric = [col for col in numeric_cols if col != customer_id_col]
        
        if available_numeric:
            # Filter out datetime columns from numeric_cols
            truly_numeric = []
            for col in available_numeric:
                if df[col].dtype in ['int64', 'float64']:
                    truly_numeric.append(col)
            
            if truly_numeric:
                customer_features = df.groupby(customer_id_col)[truly_numeric].agg(['sum', 'mean', 'count']).reset_index()
                customer_features.columns = [customer_id_col] + [f"{col[0]}_{col[1]}" for col in customer_features.columns[1:]]
            else:
                raise ValueError("No truly numeric columns available for analysis")
        else:
            raise ValueError("No numeric columns available for analysis")
    
    return customer_features

def add_derived_metrics(customer_features, df, actual_column_mapping, date_columns):
    """
    Add derived business metrics to customer features
    """
    print("Creating derived business metrics...")
    
    customer_id_col = actual_column_mapping['customer_id']
    
    # Find revenue and transaction count columns
    revenue_cols = [col for col in customer_features.columns if 'sum' in col and any(term in col.lower() for term in ['revenue', 'amount', 'price', 'sales'])]
    count_cols = [col for col in customer_features.columns if 'count' in col]
    
    # Create revenue per transaction if possible
    if revenue_cols and count_cols:
        customer_features['revenue_per_transaction'] = customer_features[revenue_cols[0]] / customer_features[count_cols[0]]
        customer_features['revenue_per_transaction'] = customer_features['revenue_per_transaction'].fillna(0)
    
    # Create engagement score from available metrics
    sum_cols = [col for col in customer_features.columns if 'sum' in col and col != customer_id_col]
    if len(sum_cols) >= 2:
        customer_features['engagement_score'] = customer_features[sum_cols[0]] / (customer_features[sum_cols[1]] + 1)
    
    # Create recency, frequency, monetary features if date columns exist
    if date_columns and len(date_columns) > 0:
        date_col = date_columns[0]
        if date_col in df.columns:
            customer_rfm = df.groupby(customer_id_col)[date_col].agg(['max', 'count']).reset_index()
            customer_rfm.columns = [customer_id_col, 'last_transaction_date', 'frequency']
            
            # Calculate recency (days since last transaction)
            current_date = df[date_col].max()
            customer_rfm['recency_days'] = (current_date - customer_rfm['last_transaction_date']).dt.days
            
            # Merge with customer_features
            customer_features = customer_features.merge(customer_rfm[[customer_id_col, 'recency_days', 'frequency']], 
                                                       on=customer_id_col, how='left')
    
    return customer_features

def final_data_cleanup(customer_features, customer_id_col):
    """
    Final cleanup of customer features data
    """
    print("Data type summary after aggregation:")
    for col in customer_features.columns:
        print(f"{col}: {customer_features[col].dtype}")
    
    # Handle any remaining data type issues
    for col in customer_features.columns:
        if col != customer_id_col:
            # Convert object columns that should be numeric
            if customer_features[col].dtype == 'object':
                try:
                    customer_features[col] = pd.to_numeric(customer_features[col], errors='coerce')
                except:
                    pass
            
            # Fill infinite values
            if customer_features[col].dtype in ['int64', 'float64']:
                customer_features[col] = customer_features[col].replace([np.inf, -np.inf], np.nan)
    
    return customer_features

def process_data(df):
    """
    Main function to process and clean all data
    
    Args:
        df (pd.DataFrame): Raw input dataframe
    
    Returns:
        tuple: (customer_features, column_mapping)
            - customer_features (pd.DataFrame): Processed customer features dataframe
            - column_mapping (dict): Mapping of business terms to actual column names
    """
    print("Starting data processing...")
    print(f"Input dataframe shape: {df.shape}")
    print(f"Input columns: {df.columns.tolist()}")
    
    # Step 1: Standardize column names
    df = standardize_column_names(df)
    print("\nStandardized columns:")
    print(df.columns.tolist())
    
    # Step 2: Create column mapping
    actual_column_mapping = create_column_mapping(df)
    print(f"\nActual column mapping found: {actual_column_mapping}")
    
    # Step 3: Ensure customer_id exists
    df, actual_column_mapping = ensure_customer_id(df, actual_column_mapping)
    print(f"\nAfter ensuring customer_id - mapping: {actual_column_mapping}")
    
    # Verify customer_id is in mapping
    if 'customer_id' not in actual_column_mapping:
        raise ValueError("Failed to establish customer_id column mapping")
    
    customer_id_col = actual_column_mapping['customer_id']
    print(f"Using customer_id column: {customer_id_col}")
    
    # Step 4: Clean data
    df, date_columns = clean_data(df, actual_column_mapping)
    
    # Step 5: Create customer features
    customer_features = create_customer_features(df, actual_column_mapping)
    
    # Step 6: Add derived metrics
    customer_features = add_derived_metrics(customer_features, df, actual_column_mapping, date_columns)
    
    # Step 7: Final cleanup
    customer_features = final_data_cleanup(customer_features, customer_id_col)
    
    print(f"\nFinal customer features shape: {customer_features.shape}")
    print("Final customer features columns:", customer_features.columns.tolist())
    
    return customer_features, actual_column_mapping

def save_processed_data(customer_features, filepath="../data/processed/customer_features.csv"):
    """
    Save processed customer features to CSV file
    
    Args:
        customer_features (pd.DataFrame): Processed customer features dataframe
        filepath (str): Path to save the CSV file
    """
    # Create directory if it doesn't exist
    output_dir = Path(filepath).parent
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Save to CSV
    customer_features.to_csv(filepath, index=False)
    print(f"Customer features saved to: {filepath}")
    print(f"File size: {os.path.getsize(filepath) / 1024:.2f} KB")

def get_data_summary(customer_features):
    """
    Get comprehensive summary of the processed data
    
    Args:
        customer_features (pd.DataFrame): Processed customer features dataframe
    
    Returns:
        dict: Summary statistics and information about the data
    """
    print("\n" + "="*50)
    print("DATA SUMMARY")
    print("="*50)
    
    summary = {}
    
    # Basic info
    summary['shape'] = customer_features.shape
    summary['columns'] = customer_features.columns.tolist()
    summary['dtypes'] = customer_features.dtypes.to_dict()
    
    print(f"Dataset Shape: {summary['shape']}")
    print(f"Number of Customers: {summary['shape'][0]}")
    print(f"Number of Features: {summary['shape'][1]}")
    
    # Data types
    print(f"\nData Types:")
    for col, dtype in summary['dtypes'].items():
        print(f"  {col}: {dtype}")
    
    # Missing values
    missing_values = customer_features.isnull().sum()
    summary['missing_values'] = missing_values.to_dict()
    
    print(f"\nMissing Values:")
    for col, missing in summary['missing_values'].items():
        if missing > 0:
            print(f"  {col}: {missing} ({missing/len(customer_features)*100:.2f}%)")
    
    # Numeric columns statistics
    numeric_cols = customer_features.select_dtypes(include=[np.number]).columns
    if len(numeric_cols) > 0:
        summary['numeric_stats'] = customer_features[numeric_cols].describe().to_dict()
        print(f"\nNumeric Columns Summary:")
        print(customer_features[numeric_cols].describe())
    
    # Customer ID info
    if 'customer_id' in customer_features.columns:
        print(f"\nCustomer ID Info:")
        print(f"  Unique customers: {customer_features['customer_id'].nunique()}")
        print(f"  Duplicate customer IDs: {customer_features['customer_id'].duplicated().sum()}")
    
    # Sample data
    print(f"\nSample Data (First 5 Rows):")
    print(customer_features.head())
    
    summary['sample_data'] = customer_features.head().to_dict()
    
    return summary

