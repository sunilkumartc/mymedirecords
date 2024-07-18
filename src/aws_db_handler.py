import time
import psycopg2
from psycopg2.errors import ForeignKeyViolation
from config import AWS_DB_PORT, AWS_DB_NAME, AWS_DB_USER_NAME, AWS_DB_PASS, AWS_RDS_HOST, tests
from utils import convert_to_postgres_timestamp
from log import logger

class DBHandler:
    def __init__(self):
        self.conn = None
        self.connect_db()
        self.insert_sql = "INSERT INTO tbltestresults (testid, patientid, reportid, testvalue, status, " \
                          "uploadeddatetime) VALUES (%s, %s, %s, %s, %s, %s)"
        self.update_status = """UPDATE tblreports SET status = %s, doctor_name = %s, patient_name=%s, gender=%s WHERE patientid = %s and reportid = %s"""
        self.delete_sql = """DELETE FROM tbltestresults WHERE patientid = %s and reportid = %s"""
        self.test_map = {test_name: idx + 1 for idx, test_name in enumerate(list(tests.keys()))}

    def connect_db(self):
        max_retries = 3
        retry_delay = 5

        for attempt in range(max_retries):
            try:
                self.conn = psycopg2.connect(
                    host=AWS_RDS_HOST,
                    dbname=AWS_DB_NAME,
                    user=AWS_DB_USER_NAME,
                    password=AWS_DB_PASS,
                    port=AWS_DB_PORT
                )
                break
            except psycopg2.OperationalError as e:
                logger.error("Error:", e)
                if attempt < max_retries - 1:
                    logger.info(f"Retrying in {retry_delay} seconds...")
                    time.sleep(retry_delay)
                    retry_delay *= 2
                else:
                    # Handle maximum retry attempts exceeded
                    logger.info("Maximum retry attempts exceeded.")
                    logger.error("ERROR: Not able to connect to db...")

    def dump_test_results(self, patient_id, report_id, results):
        try:
            with self.conn.cursor() as cur:
                # Delete existing records
                logger.info(f"Deleting existing records for patient_id: {patient_id}, report_id: {report_id}")
                cur.execute(self.delete_sql, (patient_id, report_id,))
                logger.info(f"Deleted existing records for patient_id: {patient_id}, report_id: {report_id}")
                
                # Fetch the result
                report_date = convert_to_postgres_timestamp(results['PersonalDetails'][0]['ReportDate'])
                doctor_name = results['PersonalDetails'][0]['DoctorName']
                patient_name = results['PersonalDetails'][0]['Name'] 
                gender = results['PersonalDetails'][0]['Gender']

                count = 0
                test_results = results  # ['TestResult']
                
                # Insert new records
                for test_name in test_results.keys():
                    try:
                        if test_name in self.test_map.keys() and test_results[test_name]['testValue'] != "TBD":
                            # Check if testid exists in tbltest
                            testid = self.test_map[test_name]
                            logger.info(f"Checking if testid {testid} exists in tbltest")
                            cur.execute("SELECT 1 FROM tbltest WHERE testid = %s", (testid,))
                            if cur.fetchone():
                                logger.info(f"testid {testid} exists, inserting result for testname '{test_name}'")
                                count += 1
                                cur.execute(self.insert_sql, (
                                    testid,
                                    patient_id,
                                    report_id,
                                    test_results[test_name]['testValue'],
                                    test_results[test_name]['testStatus'],
                                    report_date,
                                ))
                                logger.info(f"Inserted result for testid {testid}, testname '{test_name}'")
                            else:
                                logger.warning(f"WARNING: testid {testid} for testname '{test_name}' does not exist in tbltest.")
                    except KeyError:
                        logger.warning(f"WARNING: New testid found for testname: {test_name}")

                # Update report status
                logger.info(f"Updating report status for patient_id: {patient_id}, report_id: {report_id}")
                cur.execute(self.update_status, (1, doctor_name, patient_name, gender, patient_id, report_id,))
                logger.info(f"Updated report status for patient_id: {patient_id}, report_id: {report_id}")
                
                # Commit the changes
                self.conn.commit()
                logger.info(f"Committed changes for patient_id: {patient_id}, report_id: {report_id}")

        except ForeignKeyViolation as fk_err:
            logger.error(f"ForeignKeyViolation: {fk_err}")
            self.conn.rollback()  # Rollback changes if foreign key violation occurs

        except psycopg2.OperationalError:
            logger.error("OperationalError: Reconnecting to database...")
            self.connect_db()  # Reconnect to the database
            return self.dump_test_results(patient_id, report_id, results)  # Retry the operation

        except Exception as e:
            logger.error(f"Error in dump_test_results: {e}")
            self.conn.rollback()  # Rollback changes if any error occurs
            raise  # Re-raise the exception for handling in higher layers
        
        finally:
            if self.conn:
                logger.info('Closing the DB connection')
                self.conn.close()  # Close connection if still open
        
        return count, doctor_name, patient_name, gender

if __name__ == "__main__":
    temp = DBHandler()
    cur = temp.conn.cursor()
    print("connected!!")
