
"""
A/B Testing Framework for Product Experiments
===========================================

This module provides a comprehensive framework for designing, running, and analyzing
A/B tests and product experiments. It includes statistical testing, effect size
calculations, confidence intervals, and visualization capabilities.

Usage:
    from src.experimentation import ExperimentAnalyzer
    
    analyzer = ExperimentAnalyzer(df)
    results = analyzer.run_experiment('pricing_test', 'treatment_group', ['conversion_rate', 'revenue'])
    analyzer.generate_report()
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats
from scipy.stats import chi2_contingency, mannwhitneyu, ttest_ind, normaltest
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
from typing import Dict, List, Tuple, Optional, Any
import warnings
from datetime import datetime, timedelta
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Suppress warnings for cleaner output
warnings.filterwarnings('ignore')

class ExperimentAnalyzer:
    """
    Comprehensive A/B testing analysis framework for product experiments.
    
    This class provides methods for:
    - Statistical significance testing (t-test, Mann-Whitney U, Chi-square)
    - Effect size calculations (Cohen's d)
    - Confidence interval estimation
    - Power analysis
    - Multi-variate experiment analysis
    - Visualization and reporting
    """
    
    def __init__(self, df):
        self.df = df
        self.results = {}


    def statistical_significance_test(self, metric, experiment_col, alpha=0.05):
        """Perform statistical significance testing"""
        
        control_data = self.df[self.df[experiment_col] == 'Control'][metric].dropna()
        treatment_data = self.df[self.df[experiment_col] == 'Treatment'][metric].dropna()
        
        # Check for normality
        _, control_normal = normaltest(control_data)
        _, treatment_normal = normaltest(treatment_data)
        
        # Choose appropriate test
        if control_normal > 0.05 and treatment_normal > 0.05:
            # Normal distribution - use t-test
            statistic, p_value = ttest_ind(control_data, treatment_data)
            test_type = "T-test"
        else:
            # Non-normal distribution - use Mann-Whitney U test
            statistic, p_value = mannwhitneyu(control_data, treatment_data, 
                                            alternative='two-sided')
            test_type = "Mann-Whitney U"
        
        # Calculate effect size (Cohen's d)
        pooled_std = np.sqrt(((len(control_data) - 1) * control_data.var() + 
                             (len(treatment_data) - 1) * treatment_data.var()) / 
                            (len(control_data) + len(treatment_data) - 2))
        
        cohens_d = (treatment_data.mean() - control_data.mean()) / pooled_std
        
        # Calculate confidence interval
        control_mean = control_data.mean()
        treatment_mean = treatment_data.mean()
        control_std = control_data.std()
        treatment_std = treatment_data.std()
        
        se_diff = np.sqrt(control_std**2/len(control_data) + treatment_std**2/len(treatment_data))
        ci_lower = (treatment_mean - control_mean) - 1.96 * se_diff
        ci_upper = (treatment_mean - control_mean) + 1.96 * se_diff
        
        return {
            'test_type': test_type,
            'statistic': statistic,
            'p_value': p_value,
            'significant': p_value < alpha,
            'control_mean': control_mean,
            'treatment_mean': treatment_mean,
            'lift': ((treatment_mean - control_mean) / control_mean) * 100,
            'cohens_d': cohens_d,
            'ci_lower': ci_lower,
            'ci_upper': ci_upper,
            'control_n': len(control_data),
            'treatment_n': len(treatment_data)
        }
    
    def proportion_test(self, metric, experiment_col, alpha=0.05):
        """Test for proportions (conversion rates)"""
        
        control_data = self.df[self.df[experiment_col] == 'Control']
        treatment_data = self.df[self.df[experiment_col] == 'Treatment']
        
        control_conversions = control_data[metric].sum()
        control_total = len(control_data)
        treatment_conversions = treatment_data[metric].sum()
        treatment_total = len(treatment_data)
        
        # Chi-square test
        contingency_table = [[control_conversions, control_total - control_conversions],
                           [treatment_conversions, treatment_total - treatment_conversions]]
        
        chi2, p_value, dof, expected = chi2_contingency(contingency_table)
        
        control_rate = control_conversions / control_total
        treatment_rate = treatment_conversions / treatment_total
        
        # Calculate confidence interval for difference in proportions
        se_diff = np.sqrt(control_rate * (1 - control_rate) / control_total + 
                         treatment_rate * (1 - treatment_rate) / treatment_total)
        
        ci_lower = (treatment_rate - control_rate) - 1.96 * se_diff
        ci_upper = (treatment_rate - control_rate) + 1.96 * se_diff
        
        return {
            'test_type': 'Chi-square',
            'chi2_statistic': chi2,
            'p_value': p_value,
            'significant': p_value < alpha,
            'control_rate': control_rate,
            'treatment_rate': treatment_rate,
            'lift': ((treatment_rate - control_rate) / control_rate) * 100,
            'ci_lower': ci_lower,
            'ci_upper': ci_upper,
            'control_n': control_total,
            'treatment_n': treatment_total
        }
    
    def run_experiment_analysis(self, experiment_col, metrics):
        """Run complete experiment analysis"""
        
        results = {}
        
        for metric in metrics:
            if metric in ['converted']:
                # Proportion test for binary metrics
                results[metric] = self.proportion_test(metric, experiment_col)
            else:
                # Continuous metrics
                results[metric] = self.statistical_significance_test(metric, experiment_col)
        
        self.results[experiment_col] = results
        return results