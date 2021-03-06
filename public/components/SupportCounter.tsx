import * as React from 'react';
import { Idea, User, IdeaStatus } from '@fider/models';
import { SignInControl } from '@fider/components/common';

import { inject, injectables } from '@fider/di';
import { Session, IdeaService } from '@fider/services';
import { showSignIn } from '@fider/utils/page';

interface SupportCounterProps {
    user?: User;
    idea: Idea;
}

interface SupportCounterState {
    supported: boolean;
    total: number;
}

export class SupportCounter extends React.Component<SupportCounterProps, SupportCounterState> {
    @inject(injectables.Session)
    public session: Session;

    @inject(injectables.IdeaService)
    public service: IdeaService;

    constructor(props: SupportCounterProps) {
        super(props);
        this.state = {
          supported: props.idea.viewerSupported,
          total: props.idea.totalSupporters
        };
    }

    public async supportOrUndo() {
        if (!this.props.user) {
            showSignIn();
            return;
        }

        const action = this.state.supported ? this.service.removeSupport : this.service.addSupport;

        const response = await action(this.props.idea.number);
        if (response.ok) {
            this.setState((state) => ({
                supported: !state.supported,
                total: state.total + (state.supported ? -1 : 1)
            }));
        } else {
            // TODO: handle this. we should have a global alert box
        }
    }

    public render() {

        const noTouch = !('ontouchstart' in window);
        const status = IdeaStatus.Get(this.props.idea.status);

        const vote = (
            <button
              className={`ui button ${noTouch ? 'no-touch' : ''} ${this.state.supported ? 'supported' : ''} `}
              onClick={async () => await this.supportOrUndo()}
            >
              <i className="medium caret up icon" />
              {this.state.total}
            </button>
        );

        const disabled = (
          <div className="ui button disabled">
            <i className="medium caret up icon" />
            {this.state.total}
          </div>
        );

        return  (
          <div className="support-counter ui">
            {status.closed ? disabled : vote}
          </div>
        );
    }
}
