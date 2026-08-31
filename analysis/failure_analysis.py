import pandas as pd
import json
import os

def analyze_failures():
    df = pd.read_csv('data/processed/final_payment_dataset.csv')
    
    total_txns = len(df)
    successful_txns = len(df[df['payment_status'] == 'Successful'])
    failed_txns = len(df[df['payment_status'] == 'Failed'])
    failure_rate = (failed_txns / total_txns) * 100
    
    total_amount = float(df['amount'].sum())
    successful_amount = float(df[df['payment_status'] == 'Successful']['amount'].sum())
    failed_amount = float(df[df['payment_status'] == 'Failed']['amount'].sum())
    failed_amount_pct = (failed_amount / total_amount) * 100

    # Failure rate by Payment Mode
    mode_summary = df.groupby('payment_mode').agg(
        total_txns=('transaction_id', 'count'),
        failed_txns=('payment_status', lambda x: int((x == 'Failed').sum())),
        total_amount=('amount', 'sum'),
        failed_amount=('amount', lambda x: float(df.loc[x.index[df.loc[x.index, 'payment_status'] == 'Failed'], 'amount'].sum()))
    ).reset_index()
    mode_summary['failure_rate'] = (mode_summary['failed_txns'] / mode_summary['total_txns']) * 100

    # Failure rate by Merchant Category
    cat_summary = df.groupby('merchant_category').agg(
        total_txns=('transaction_id', 'count'),
        failed_txns=('payment_status', lambda x: int((x == 'Failed').sum())),
        total_amount=('amount', 'sum'),
        failed_amount=('amount', lambda x: float(df.loc[x.index[df.loc[x.index, 'payment_status'] == 'Failed'], 'amount'].sum()))
    ).reset_index()
    cat_summary['failure_rate'] = (cat_summary['failed_txns'] / cat_summary['total_txns']) * 100

    # Failure rate by Location Type
    loc_summary = df.groupby('location_type').agg(
        total_txns=('transaction_id', 'count'),
        failed_txns=('payment_status', lambda x: int((x == 'Failed').sum())),
        total_amount=('amount', 'sum'),
        failed_amount=('amount', lambda x: float(df.loc[x.index[df.loc[x.index, 'payment_status'] == 'Failed'], 'amount'].sum()))
    ).reset_index()
    loc_summary['failure_rate'] = (loc_summary['failed_txns'] / loc_summary['total_txns']) * 100

    # Peak failure hours
    hourly_summary = df.groupby('transaction_hour').agg(
        total_txns=('transaction_id', 'count'),
        failed_txns=('payment_status', lambda x: int((x == 'Failed').sum()))
    ).reset_index()
    hourly_summary['failure_rate'] = (hourly_summary['failed_txns'] / hourly_summary['total_txns']) * 100

    results = {
        "overall": {
            "total_transactions": int(total_txns),
            "successful_transactions": int(successful_txns),
            "failed_transactions": int(failed_txns),
            "failure_rate_pct": round(failure_rate, 2),
            "total_amount_inr": round(total_amount, 2),
            "successful_amount_inr": round(successful_amount, 2),
            "failed_amount_inr": round(failed_amount, 2),
            "failed_amount_pct": round(failed_amount_pct, 2)
        },
        "by_payment_mode": mode_summary.to_dict(orient='records'),
        "by_merchant_category": cat_summary.to_dict(orient='records'),
        "by_location_type": loc_summary.to_dict(orient='records'),
        "by_hour": hourly_summary.to_dict(orient='records')
    }

    os.makedirs('analysis/output', exist_ok=True)
    with open('analysis/output/failure_analysis_results.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2)

    print("=== PAYMENT FAILURE ANALYSIS COMPLETE ===")
    print(f"Total Transactions: {total_txns}")
    print(f"Failed Transactions: {failed_txns} ({failure_rate:.2f}%)")
    print(f"Total Amount: INR {total_amount:,.2f}")
    print(f"Failed Amount: INR {failed_amount:,.2f} ({failed_amount_pct:.2f}%)")
    return results

if __name__ == '__main__':
    analyze_failures()
