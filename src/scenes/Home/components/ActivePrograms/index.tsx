import React, { useContext, useEffect, useState } from 'react';

import {
  Button,
  Card,
  Col,
  notification,
  Row,
  Spin,
  Typography,
  Tag,
} from 'antd';
import axios, { AxiosResponse } from 'axios';
import { useHistory } from 'react-router-dom';

import LogInModal from '../../../../components/LogInModal';
import { API_URL } from '../../../../constants';
import { UserContext } from '../../../../index';
import { Profile, SavedProgram } from '../../../../types';
import styles from '../../styles.css';
import AddProgram from '../AddProgram';

const { Paragraph, Title } = Typography;

function ActivePrograms() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [programs, setPrograms] = useState<SavedProgram[]>([]);
  const [mentoringPrograms, setMentoringPrograms] = useState<SavedProgram[]>(
    []
  );
  const [menteePrograms, setMenteePrograms] = useState<SavedProgram[]>([]);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const user: Partial<Profile | null> = useContext(UserContext);
  const isUserAdmin: boolean = user != null && user.type == 'ADMIN';
  const history = useHistory();

  useEffect(() => {
    getPrograms();
    getMyMentoringPrograms();
    getMyMenteePrograms();
  }, []);

  const getPrograms = () => {
    setIsLoading(true);
    axios
      .get(`${API_URL}/programs`, { withCredentials: true })
      .then((response: AxiosResponse<SavedProgram[]>) => {
        setPrograms(response.data);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
        notification.error({
          message: error.toString(),
          description: 'Something went wrong when fetching the program',
        });
      });
  };

  const getMyMentoringPrograms = () => {
    setIsLoading(true);
    axios
      .get(`${API_URL}/me/programs/mentor`, {
        withCredentials: true,
      })
      .then((response: AxiosResponse<SavedProgram[]>) => {
        response.status === 204
          ? setMentoringPrograms([])
          : setMentoringPrograms(response.data);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
        if (error.response.status != 401) {
          notification.error({
            message: 'Something went wrong when fetching the user',
            description: error.toString(),
          });
        }
      });
  };

  const getMyMenteePrograms = () => {
    setIsLoading(true);
    axios
      .get(`${API_URL}/me/programs/mentee`, {
        withCredentials: true,
      })
      .then((response: AxiosResponse<SavedProgram[]>) => {
        response.status === 204
          ? setMenteePrograms([])
          : setMenteePrograms(response.data);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
        if (error.response.status != 401) {
          notification.error({
            message: 'Something went wrong when fetching the user',
            description: error.toString(),
          });
        }
      });
  };

  const handleModalPopUp = () => {
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <Spin tip="Loading..." spinning={isLoading}>
      <LogInModal
        isModalVisible={isModalVisible}
        onCancel={handleModalCancel}
      />
      <Row gutter={[16, 16]}>
        {programs.map((program: SavedProgram) => (
          <>
            {program.state !== 'COMPLETED' && program.state !== 'REMOVED' ? (
              <Col className={styles.col} md={6} key={program.id}>
                <Card
                  className={styles.card}
                  bordered={false}
                  cover={
                    <img
                      className={styles.img}
                      alt={program.title}
                      src={program.imageUrl}
                    />
                  }
                >
                  <Row>
                    <Col span={13}>
                      <Title level={4} className={styles.programTitle}>
                        {program.title}
                      </Title>
                    </Col>
                    <Col span={11} className={styles.programActionButton}>
                      <Button
                        hidden={!isUserAdmin}
                        type="primary"
                        onClick={() => history.push(`/dashboard/${program.id}`)}
                      >
                        Manage
                      </Button>
                      {program.state === 'MENTOR_APPLICATION' &&
                        !isUserAdmin &&
                        user !== null &&
                        mentoringPrograms &&
                        (!mentoringPrograms.find(
                          (mentoringProgram: SavedProgram) =>
                            mentoringProgram.id === program.id
                        ) ? (
                          <Button
                            type="primary"
                            onClick={() =>
                              history.push(
                                `/program/${program.id}/mentor/apply`
                              )
                            }
                          >
                            Apply as mentor
                          </Button>
                        ) : (
                          <Button
                            type="primary"
                            onClick={() =>
                              history.push(`/program/${program.id}/mentor/edit`)
                            }
                          >
                            Edit application
                          </Button>
                        ))}
                      {program.state === 'MENTOR_APPLICATION' && user === null && (
                        <Button type="primary" onClick={handleModalPopUp}>
                          Apply as mentor
                        </Button>
                      )}
                      {program.state === 'MENTEE_APPLICATION' &&
                        !isUserAdmin &&
                        mentoringPrograms &&
                        !mentoringPrograms.find(
                          (mentoringProgram: SavedProgram) =>
                            mentoringProgram.id === program.id
                        ) && (
                          <Button
                            type="primary"
                            onClick={() =>
                              history.push(`/program/${program.id}`)
                            }
                          >
                            Apply as mentee
                          </Button>
                        )}
                      {(program.state === 'MENTOR_CONFIRMATION' ||
                        program.state === 'ONGOING') &&
                        !isUserAdmin &&
                        user != null &&
                        !mentoringPrograms.some(
                          (mentoringProgram) =>
                            mentoringProgram.id == program.id
                        ) &&
                        menteePrograms.length !== 0 && (
                          <Button
                            type="primary"
                            onClick={() =>
                              history.push(
                                `/program/${program.id}/mentor/confirmation`
                              )
                            }
                          >
                            My mentor
                          </Button>
                        )}
                      {(program.state === 'MENTEE_SELECTION' ||
                        program.state === 'ONGOING') &&
                        !isUserAdmin &&
                        user != null &&
                        mentoringPrograms.some(
                          (mentoringProgram) =>
                            mentoringProgram.id == program.id
                        ) && (
                          <Button
                            type="primary"
                            onClick={() =>
                              history.push(`/mentor/program/${program.id}`)
                            }
                          >
                            Manage
                          </Button>
                        )}
                    </Col>
                  </Row>
                  {program.state === 'MENTOR_SELECTION' && !isUserAdmin && (
                    <Tag className={styles.tag} color="green">
                      Mentor Selection Period
                    </Tag>
                  )}
                  {program.state === 'MENTEE_SELECTION' &&
                    !isUserAdmin &&
                    !mentoringPrograms.some(
                      (mentoringProgram) => mentoringProgram.id == program.id
                    ) && (
                      <Tag className={styles.tag} color="green">
                        Mentee Selection Period
                      </Tag>
                    )}
                  {program.state === 'MENTOR_CONFIRMATION' &&
                  !isUserAdmin &&
                  (user === null ||
                    mentoringPrograms.some(
                      (mentoringProgram) => mentoringProgram.id == program.id
                    )) ? (
                    <Tag className={styles.tag} color="green">
                      Mentor Confirmation Period
                    </Tag>
                  ) : null}
                  {program.state === 'ONGOING' &&
                  !isUserAdmin &&
                  user === null ? (
                    <Tag className={styles.tag} color="green">
                      Ongoing
                    </Tag>
                  ) : null}
                  <Paragraph>{program.headline}</Paragraph>
                </Card>
                <Row className={styles.viewMoreButton}>
                  <a
                    target={'_blank'}
                    rel={'noreferrer'}
                    href={program.landingPageUrl}
                  >
                    View More
                  </a>
                </Row>
              </Col>
            ) : null}
          </>
        ))}
        {isUserAdmin && (
          <Col md={6}>
            <AddProgram />
          </Col>
        )}
      </Row>
    </Spin>
  );
}

export default ActivePrograms;
