import React, { useEffect, useReducer, useState } from "react";
import { Switch, Route, Redirect } from "react-router-dom";

import "./index.css";
import "./App.css";
import Spinner from "./components/08CommonComponents/Spinner";
import swal from "sweetalert";

import Login from "./components/01Login/LoginContainer";
import NotFound from "./components/03NotFound/NotFound";
import Admin from "./components/04Admin/AdminContainer";
import UserListContainer from "./components/04Admin/UserListContainer";
import KindergartenContainer from "./components/05Kindengarten/KindergartenContainer";
import UpdateProfileFormContainer from "./components/06UpdateProfile/UpdateProfileFormContainer";
import CreateApplicationFormContainer from "./components/07Application/CreateApplicationFormContainer";

import AdminNavBar from "./components/00Navigation/AdminNavBar";
import UserNavBar from "./components/00Navigation/UserNavBar";
import ManagerNavBar from "./components/00Navigation/ManagerNavBar";

import AuthContext from "./components/11Context/AuthContext";
import ManagerCompesationContext from "./components/11Context/ManagerCompesationContext";

import http from "./components/10Services/httpService";
import CommonErrorHandler from "./components/10Services/CommonErrorHandler";
import apiEndpoint from "./components/10Services/endpoint";
import { UserHomeContainer } from "./components/02Main/UserHomeContainer";
import { KindergartenStatContainer } from "./components/09Statistics/KindergartenStatContainer";
import { QueueContainer } from "./components/12Queue/QueueContainer";
import UserDocumentContainer from "./components/13UserDocuments/UserDocumentContainer";
import { ApplicationStatusContainer } from "./components/04Admin/ApplicationStatusContainer";
import EventJournalContainer from "./components/14EventJournal/EventJournalContainer";
import Compensation from "./components/07Application/Compensation";
import MapViewContainer from "./components/15MapComponent/MapViewContainer";

import SubmittedDocsContainer from "./components/13UserDocuments/SubmittedDocsContainer";
import ManagerCompensations from "./components/02Main/ManagerCompensations";
import ManagerReviewTable from "./components/02Main/ManagerReviewTable";
import DownloadReviewTable from "./components/02Main/DownloadReviewTable";
import {CreateUserForm} from "./components/01Login/CreateUserForm"; 

var initState = {
  isAuthenticated: null,
  username: null,
  role: null,
  error: null,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        isAuthenticated: true,
        username: action.payload.username,
        role: action.payload.role,
        error: null,
      };
    case "LOGOUT":
      return {
        ...state,
        isAuthenticated: false,
        username: null,
        role: null,
        error: null,
      };
    case "ERROR":
      return {
        ...state,
        isAuthenticated: false,
        username: null,
        role: null,
        error: action.payload,
      };
    default:
      return state;
  }
};

function App() {
  const [state, dispatch] = useReducer(reducer, initState);
  const [compState, setCompState] = useState([]);

   useEffect(() => {
    if (state.isAuthenticated === null) {
      http
        .get(`${apiEndpoint}/api/loggedUserRole`)
        .then((resp) => {
          dispatch({
            type: "LOGIN",
            payload: { role: resp.data },
          });
        })
        .catch((error) => {
          const unexpectedError =
            error.response &&
            error.response.status >= 400 &&
            error.response.status < 500;

          if (
            !unexpectedError ||
            (error.response && error.response.status === 404)
          ) {
            swal("Įvyko klaida, puslapis nurodytu adresu nepasiekiamas");
            dispatch({
              type: "ERROR",
            });
          } else
            dispatch({
              type: "ERROR",
              payload: error.response.status,
            });
        });
    }
  }, [state.isAuthenticated]);

  if (state.isAuthenticated) {
    switch (state.role) {
      case "ADMIN":
        return (
          <AuthContext.Provider value={{ state, dispatch }}>
            <CommonErrorHandler>
              <div className="container-fluid px-0">
                <AdminNavBar>
                  <Switch>
                    <Route exact path="/" component={Admin} />
                    <Route exact path="/home" component={Admin} />
                    <Route exact path="/admin" component={Admin} />
                    <Route
                      exact
                      path="/statistika"
                      component={KindergartenStatContainer}
                    />
                    <Route
                      exact
                      path="/prasymai"
                      component={ApplicationStatusContainer}
                    />
                    <Route
                      exact
                      path="/naudotojai"
                      component={UserListContainer}
                    />
                    <Route
                      exact
                      path="/zurnalas"
                      component={EventJournalContainer}
                    />
                    <Route
                      exact
                      path="/profilis"
                      component={UpdateProfileFormContainer}
                    />
                    <Route path="*" component={NotFound} />
                  </Switch>
                </AdminNavBar>
              </div>
            </CommonErrorHandler>
          </AuthContext.Provider>
        );
      case "MANAGER":
        return (
          <AuthContext.Provider value={{ state, dispatch }}>
            <ManagerCompesationContext.Provider
              value={{ compState, setCompState }}
            >
              <CommonErrorHandler>
                <div className="container-fluid px-0">
                  <ManagerNavBar>
                    <Switch>
                      <Route exact path="/" component={KindergartenContainer} />
                      <Route
                        exact
                        path="/home"
                        component={KindergartenContainer}
                      />

                      <Route
                        exact
                        path="/kompensacijos/:id"
                        component={ManagerReviewTable}
                      />
                      <Route
                        exact
                        path="/kompensacijos/download/:id"
                        component={DownloadReviewTable}
                      />
                      <Route
                        exact
                        path="/kompensacijos"
                        component={ManagerCompensations}
                      />

                      <Route
                        exact
                        path="/pazymos"
                        component={SubmittedDocsContainer}
                      />
                      <Route
                        exact
                        path="/statistika"
                        component={KindergartenStatContainer}
                      />
                      <Route
                        exact
                        path="/darzeliai"
                        component={KindergartenContainer}
                      />

                      <Route
                        exact
                        path="/pazymos"
                        component={SubmittedDocsContainer}
                      />

                      <Route
                        exact
                        path="/zemelapis"
                        component={MapViewContainer}
                      />

                      <Route exact path="/eile" component={QueueContainer} />
                      <Route
                        exact
                        path="/profilis"
                        component={UpdateProfileFormContainer}
                      />
                      <Route path="*" component={NotFound} />
                    </Switch>
                  </ManagerNavBar>
                </div>
              </CommonErrorHandler>
            </ManagerCompesationContext.Provider>
          </AuthContext.Provider>
        );
      case "USER":
        return (
          <AuthContext.Provider value={{ state, dispatch }}>
            <CommonErrorHandler>
              <div className="container-fluid px-0">
                <UserNavBar>
                  <Switch>
                    <Route exact path="/" component={UserHomeContainer} />
                    <Route exact path="/home" component={UserHomeContainer} />
                    <Route
                      exact
                      path="/prasymai"
                      component={UserHomeContainer}
                    />
                    <Route
                      exact
                      path="/statistika"
                      component={KindergartenStatContainer}
                    />
                    <Route
                      exact
                      path="/prasymai/registracija"
                      component={CreateApplicationFormContainer}
                    />
                    <Route
                      exact
                      path="/prasymai/kompensacija"
                      component={Compensation}
                    />
                    <Route
                      exact
                      path="/zemelapis"
                      component={MapViewContainer}
                    />
                    <Route
                      exact
                      path="/profilis"
                      component={UpdateProfileFormContainer}
                    />
                    <Route
                      exact
                      path="/pazymos"
                      component={UserDocumentContainer}
                    />
                    <Route path="*" component={NotFound} />
                  </Switch>
                </UserNavBar>
              </div>
            </CommonErrorHandler>
          </AuthContext.Provider>
        );
      default:
        return (
          <AuthContext.Provider value={{ state, dispatch }}>
            <div className="container-fluid px-0">
              <NotFound />
            </div>
          </AuthContext.Provider>
        );
    }
  } else if (state.isAuthenticated === false) {
    return (
      <div>
        <AuthContext.Provider value={{ state, dispatch }}>
          <Switch>
            <Route exact path="/login" component={Login} />
            <Route exact path="/createAccount" component={CreateUserForm} />
            <Route path="*">
              <Redirect to="/login" />
            </Route>
          </Switch>
        </AuthContext.Provider>
      </div>
    );
  } else return <Spinner />;
}

export default App;
