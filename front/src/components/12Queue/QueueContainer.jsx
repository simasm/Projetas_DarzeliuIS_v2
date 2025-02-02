import React, { Component } from "react";
import swal from "sweetalert";
//import Pagination from "react-js-pagination";
import Pagination from "../08CommonComponents/Pagination";
import "../../App.css";

import http from "../10Services/httpService";
import apiEndpoint from "../10Services/endpoint";

import QueueTable from "./QueueTable";
import QueueProcessedTable from "./QueueProcessedTable";

import SearchBox from "./../08CommonComponents/SeachBox";
import Buttons from "./Buttons";
export class QueueContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      applications: [],
      pageSize: 12,
      currentPage: 1,
      totalPages: 0,
      totalElements: 0,
      numberOfElements: 0,
      searchQuery: "",
      isActive: false,
      isLocked: false,
      currentButtonValue: "",
      invalidSearch: false,
    };
  }
  componentDidMount() {
    this.getApplicationState();
  }

  getApplicationState() {
    http
      .get(`${apiEndpoint}/api/status`)
      .then((response) => {
        let buttonValue = response.data.registrationActive ? "On" : "Off";

        this.setState(
          {
            isActive: response.data.registrationActive,
            isLocked: response.data.queueEditingLocked,
            currentButtonValue: buttonValue,
          },
          function () {
            this.getApplications(this.state.currentPage, "");
          }
        );
      })
      .catch(() => {});
  }

  getApplications(currentPage, personalCode) {
    const { pageSize, isActive } = this.state;

    let page = currentPage - 1;

    if (page < 0) page = 0;

    if (isActive) {
      var uri = `${apiEndpoint}/api/prasymai/manager?page=${page}&size=${pageSize}`;

      if (personalCode !== "") {
        uri = `${apiEndpoint}/api/prasymai/manager/page/${personalCode}?page=${page}&size=${pageSize}`;
      }
    } else {
      uri = `${apiEndpoint}/api/eile/manager/queue?page=${page}&size=${pageSize}`;

      if (personalCode !== "") {
        uri = `${apiEndpoint}/api/eile/manager/queue/${personalCode}?page=${page}&size=${pageSize}`;
      }
    }

    if (uri) {
      http
        .get(uri)
        .then((response) => {
          this.setState({
            applications: response.data.content,
            totalPages: response.data.totalPages,
            totalElements: response.data.totalElements,
            numberOfElements: response.data.numberOfElements,
            currentPage: response.data.number + 1,
          });
        })
        .catch(() => {});
    }
  }

  resetState() {
    this.setState({
      applications: [],
      currentPage: 1,
      totalPages: 0,
      totalElements: 0,
      numberOfElements: 0,
      searchQuery: "",
    });
  }

  handleClick = (e) => {
    const buttonValue = e.currentTarget.value;

    if (buttonValue !== this.state.currentButtonValue) {
      this.resetState();

      if (buttonValue === "On") {
        http
          .post(`${apiEndpoint}/api/status/${true}`)
          .then(() => {
            this.setState(
              {
                isActive: true,
                currentButtonValue: buttonValue,
              },
              function () {
                this.getApplications(1, "");
              }
            );
          })
          .catch(() => {});
      } else {
        http
          .post(`${apiEndpoint}/api/status/${false}`)
          .then(() => {
            this.setState(
              {
                isActive: false,
                currentButtonValue: buttonValue,
              },
              function () {
                this.getApplications(1, "");
              }
            );
          })
          .catch(() => {});
      }
    }
  };

  handleProcessQueue = () => {
    const buttonValue = "Process";

    if (buttonValue !== this.state.currentButtonValue) {
      this.resetState();

      http
        .post(`${apiEndpoint}/api/queue/process`)
        .then((response) => {
          swal({
            text: response.data,
            button: "Gerai",
          });
          this.setState(
            {
              currentButtonValue: buttonValue,
            },
            function () {
              this.getApplications(1, "");
            }
          );
        })
        .catch(() => {});
    }
  };

  handleConfirmQueue = () => {
    const buttonValue = "Confirm";

    if (buttonValue !== this.state.currentButtonValue) {
      swal({
        text: "DĖMESIO! Šio veiksmo negalėsite atšaukti!\n\nPo patvirtinimo bus automatiškai išsiųsti pranešimai vaiko atstovams.\nAr tikrai norite patvirtinti eiles?",
        buttons: ["Ne", "Taip"],
        dangerMode: true,
      }).then((actionConfirmed) => {
        if (actionConfirmed) {
          this.resetState();

          http
            .post(`${apiEndpoint}/api/queue/confirm`)
            .then((response) => {
              swal({
                text: response.data,
                button: "Gerai",
              });
              this.setState(
                {
                  currentButtonValue: buttonValue,
                },
                function () {
                  this.getApplications(1, "");
                }
              );
            })
            .catch((error) => {
              if (error && error.response.status === 405) {
                swal({
                  text: error.response.data,
                  button: "Gerai",
                });
                this.getApplications(1, "");
              }
            });
        }
      });
    }
  };

  handleSearch = (e) => {
    const personalCode = e.currentTarget.value;

    const re = /^[0-9]+$/;
    if (personalCode === "" || re.test(personalCode)) {
      this.setState({ searchQuery: personalCode });
      this.getApplications(1, personalCode);
    } else {
      this.setState({ invalidSearch: true });
      setTimeout(() => this.setState({ invalidSearch: false }), 500);
    }
  };

  handleDeactivate = (item) => {
    swal({
      text: "DĖMESIO! Šio veiksmo negalėsite atšaukti!\n\nAr tikrai norite deaktyvuoti prašymą?",
      buttons: ["Ne", "Taip"],
      dangerMode: true,
    }).then((actionConfirmed) => {
      if (actionConfirmed) {
        const id = item.id;
        const { currentPage, numberOfElements } = this.state;
        const page = numberOfElements === 1 ? currentPage - 1 : currentPage;

        http
          .post(`${apiEndpoint}/api/prasymai/manager/deactivate/${id}`)
          .then((response) => {
            swal({
              text: response.data,
              button: "Gerai",
            });
            this.getApplications(page, "");
          })
          .catch((error) => {
            if (error && error.response.status === 405) {
              swal({
                text: "Įvyko klaida. " + error.response.data,
                button: "Gerai",
              });
            }
          });
      }
    });
  };

  handlePageChange = (page) => {
    this.setState({ currentPage: page });
    this.getApplications(page, this.state.searchQuery);
  };

  render() {
    const {
      applications,
      totalPages,
      searchQuery,
      isActive,
      isLocked,
      currentButtonValue,
    } = this.state;

    let size = 0;

    if (applications !== undefined) size = applications.length;

    const placeholder = "Ieškoti pagal vaiko asmens kodą...";

    return (
      <div className="container pt-4">

        <h6 className="pl-2 pt-3">Registracijų eilė</h6>
        {isActive && <p className="pl-2 pt-3">Registracija vykdoma</p>}
        {!isActive && (
          <p className="pl-2 pt-3">Šiuo metu registracija nevykdoma</p>
        )}

        <Buttons
          onClick={this.handleClick}
          onProcess={this.handleProcessQueue}
          onConfirm={this.handleConfirmQueue}
          isActive={isActive}
          currentButtonValue={currentButtonValue}
          size={size}
        />

        {(size > 0 || searchQuery !== "") && (
          <SearchBox
            value={searchQuery}
            onSearch={this.handleSearch}
            placeholder={placeholder}
            style={
              this.state.invalidSearch
                ? { border: "2px solid red" }
                : { border: "2px solid lightgrey" }
            }
          />
        )}

        <div className=" ">
          {isActive && (
            <QueueTable
              applications={applications}
              isLocked={isLocked}
              onDeactivate={this.handleDeactivate}
            />
          )}

          {!isActive && (
            <QueueProcessedTable
              applications={applications}
              isLocked={isLocked}
              onDeactivate={this.handleDeactivate}
            />
          )}

          {totalPages > 1 && (
            <div className="d-flex justify-content-center">
              <Pagination
                currentPage={this.state.currentPage}
                pageSize={this.state.pageSize}
                itemsCount={this.state.totalElements}
                pageRangeDisplayed={15}
                onPageChange={this.handlePageChange.bind(this)}
              />
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default QueueContainer;
