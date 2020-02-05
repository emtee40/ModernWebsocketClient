import {
  IonButtons,
  IonContent,
  IonPage,
  IonHeader,
  IonBackButton,
  IonToolbar,
  IonFooter,
  IonTitle,
  IonIcon,
  IonButton,
  IonItem, IonList, IonLabel, IonPopover
} from '@ionic/react';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router';
import { actions, RootState, selectors } from '../../store';
import { Command, Connection, Message } from '../../store/connections/types';
import ChatList from '../../components/chat/ChatList'
import { } from '@ionic/react';

import { Trans } from 'react-i18next';
import { withTranslation, WithTranslation } from 'react-i18next';

import {
  send,
  menu
} from 'ionicons/icons';


type Props = RouteComponentProps<{ id: string, tab: string }> & typeof mapDispatchToProps & ReturnType<typeof mapStateToProps> & {
  // connection: Connection
};

type State = {
  textinput: string;
  showPopover: boolean;
  event: React.MouseEvent | undefined;
  history_location: number;
  // connections: Connection[] | undefined;
};


class Chat extends Component<Props & WithTranslation, State> {
  state = {
    textinput: '',
    showPopover: false,
    event: undefined,
    history_location: -1
    // connections: undefined,
  };
  onSubmit(e: React.FormEvent) {
    e.preventDefault()
    this.onSubmit2()
  }
  onSubmit2() {
    if (this.props.connection === undefined) { return }
    this.setState({ textinput: "", history_location: -1 });
    this.props.sendWebsocket(this.props.connection, this.state.textinput);
    // if(this.props.active===undefined){return}
    this.props.saveConnections(this.props.connections, this.props.connection)
  }
  onChange(e: any) {
    this.setState({ textinput: e.target.value });
  }

  clearMessages() {
    if (this.props.connection === undefined) { return }
    this.props.clearMessages(this.props.connection);
  }

  filterCommands(commands: Command[], searchtext: string, count: number) {
    return commands.filter(comm2 => comm2.value.toLowerCase() !== searchtext.toLowerCase()).filter(comm => comm.value.toLowerCase().indexOf(searchtext.toLowerCase()) !== -1).sort((a, b) => (
      b.num - a.num
    )).slice(0, count).reverse()
  }
  showMenu(e: React.MouseEvent) {
    e.persist()
    this.setState({ ...this.state, showPopover: !this.state.showPopover, event: e })
  }
  connect(e: React.MouseEvent) {
    if (this.props.connection === undefined) { return }
    e.preventDefault()
    this.props.establishConnection(this.props.connection)
  }
  onKeyDown(e: React.KeyboardEvent) {
    console.log(e.keyCode)
    if (this.props.connection === undefined) { return }
    var lastInputs = this.props.connection.messages.filter((value: Message) => {
      if (value.member.id === -1) {
        return value
      }
      return undefined
    }).reverse()
    if (e.keyCode === 38) {
      if (this.state.history_location < lastInputs.length-1) {
        this.setState({ textinput: lastInputs[this.state.history_location + 1].text, history_location: this.state.history_location + 1 });
      }
    }
    else if (e.keyCode === 40) {
      if (this.state.history_location >= 1) {
        this.setState({ textinput: lastInputs[this.state.history_location - 1].text, history_location: this.state.history_location - 1 });
      } else {
        this.setState({ textinput: "", history_location: -1 });
      }
    }
  }
  render() {

    var text = this.state.textinput
    var commands: Command[] = []
    if (this.props.connection === undefined) { return (<></>) }
    if (this.props.connection.chatInput !== undefined) {
      this.setState({ ...this.state, textinput: this.props.connection.chatInput })
      text = this.props.connection.chatInput
      this.props.setChatInput(this.props.connection, undefined)
    }
    commands = this.filterCommands(this.props.connection.commands, text, 3);
    const connection = this.props.connection
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref='/connect' />
              {/* <IonMenuButton /> */}
            </IonButtons>
            <IonButton expand="full" fill="outline" routerLink={'/connect/' + this.props.connection.id}><IonTitle>{this.props.connection.name}</IonTitle></IonButton>
            <IonButtons slot="end">
              <IonPopover
                isOpen={this.state.showPopover}
                event={this.state.event}
                onDidDismiss={e => this.setState({ ...this.state, showPopover: false })}
              >
                <IonButton expand="full" routerLink={'/connect/' + this.props.connection.id}><Trans>Settings</Trans></IonButton>
                <IonButton expand="full" onClick={() => { this.clearMessages() }}><Trans>Clear</Trans></IonButton>
                {this.props.connection.connected === false ?
                  <IonButton color="secondary" expand="full" onClick={() => (this.props.establishConnection(connection))}><Trans>Connect</Trans></IonButton>
                  :
                  <IonButton color="error" expand="full" onClick={() => (this.props.quitConnection(connection))}><Trans>Disconnect</Trans></IonButton>
                }
              </IonPopover>
              <IonButton onClick={(e) => this.showMenu(e)}><Trans><IonIcon icon={menu}></IonIcon></Trans></IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <ChatList
            connection={this.props.connection}
            messages={this.props.connection.messages}
          ></ChatList>
        </IonContent>
        <IonFooter className="Footer" style={{ "color": "transparent" }} >
          {this.props.connection.connected === true ?
            <>
              {(this.state.textinput.length > 0 && commands.length > 0) &&

                <IonList color='secondary'>
                  {commands.map((c: Command, idx: number) => (
                    <IonItem key={'recom' + idx} onClick={() => this.props.setChatInput(connection, c.value)}>
                      <IonLabel>{c.value}</IonLabel>
                      {/* <IonLabel>{c.num}</IonLabel> */}
                    </IonItem>
                  ))}
                </IonList>
              }
              <form onSubmit={e => this.onSubmit(e)}>
                <input
                  onKeyDown={(e) => this.onKeyDown(e)}
                  onChange={e => this.onChange(e)}
                  value={text}
                  type="text"
                  placeholder={this.props.t("Enter your message and press ENTER")

                  }
                />
                <IonButton onClick={e => this.onSubmit2()}><IonIcon icon={send}></IonIcon></IonButton>
              </form>
            </>
            :
            <IonButton expand="full" onClick={(e) => (this.connect(e))}><Trans>Connect</Trans></IonButton>
          }
        </IonFooter>
      </IonPage>
    );
  };

  updateState(event: any, key: string) {
    this.setState({ ...this.state, [key]: event.target.value })
  }

}
const mapStateToProps = (state: RootState, ownProps: RouteComponentProps<{ id: string, tab: string }>) => ({
  connections: state.connections.connections,
  connection: selectors.connection.connectionByID(state.connections.connections, parseInt(ownProps.match.params.id, 10)),
  // messages: state.connections.messages,
  // chatInput: state.connections.chatInput
});

const mapDispatchToProps = {
  quitConnection: (connection: Connection) => actions.connection.quitConnection(connection),
  establishConnection: (connection: Connection) => actions.connection.establishConnection(connection),
  sendWebsocket: (con: Connection, message: string) => actions.connection.sendWebsocket(con, message),
  clearMessages: (con: Connection) => actions.connection.clearMessages(con),
  setChatInput: (con: Connection, text: string | undefined) => actions.connection.setChatInput(con, text),
  saveConnections: (connections: Connection[], active: Connection) => actions.connection.saveConnections(connections, active),
};

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withTranslation()(Chat)));
